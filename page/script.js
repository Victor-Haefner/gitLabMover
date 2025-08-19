class GitLabPanel {
    constructor(panelId) {
        this.panelId = panelId;
        this.server = "";
        this.token = "";
        this.projectName = "";

        // Grab inputs inside this panel
        this.serverInput  = document.querySelector(`#${panelId} input[data-key="server"]`);
        this.tokenInput   = document.querySelector(`#${panelId} input[data-key="token"]`);
        this.pathInput    = document.querySelector(`#${panelId} input[data-key="path"]`);
        this.projectInput = document.querySelector(`#${panelId} input[data-key="project"]`);

        // Attach listeners
        [this.serverInput, this.tokenInput, this.projectInput].forEach(input => {
            if (input) {
                input.addEventListener("input", () => this.updateFromInputs());
            }
        });
    }

    // Sync class members with input values
    updateFromInputs() {
        this.server = this.serverInput?.value || "";
        this.token = this.tokenInput?.value || "";
        this.projectName = this.projectInput?.value || "";
    }

    // Sync inputs with class members
    updateInputs() {
        if (this.serverInput) this.serverInput.value = this.server;
        if (this.tokenInput) this.tokenInput.value = this.token;
        if (this.projectInput) this.projectInput.value = this.projectName;
    }

    // Load initial values from config object
    loadFromConfig(config) {
        if (config[this.panelId]) {
            this.server = config[this.panelId].server || "";
            this.token = config[this.panelId].token || "";
            this.projectName = config[this.panelId].project || "";
            this.updateInputs();
        }
    }

    // Fetch accessible projects from GitLab
    async fetchProjects() {
        if (!this.server || !this.token) {
            throw new Error("Server or token missing.");
        }

        const url = `${this.server}/api/v4/projects?search=${encodeURICom
        const res = await fetch(url, {
            headers: { "PRIVATE-TOKEN": this.token }
        });

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    }
}



document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[data-panel]");

  // Load config.json on page load
  fetch("load_config.php")
    .then(res => res.json())
    .then(config => {
      inputs.forEach(input => {
        let panel = input.dataset.panel;
        let key = input.dataset.key;
        if (config[panel] && config[panel][key]) {
          input.value = config[panel][key];
        }
      });
    })
    .catch(() => console.log("No config yet."));

  // Save on input change
  inputs.forEach(input => {
    input.addEventListener("change", () => {
      let panel = input.dataset.panel;
      let key = input.dataset.key;
      let value = input.value;
      console.log("yay");
      fetch("save_config.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panel, key, value })
      })
      .then(res => res.text())
      .then(txt => console.log("Save response:", txt))
      .catch(err => console.error("Save error:", err));
    });
  });
});

function updatePanel() { // TODO
    const server = document.getElementById("gitlab-server").value;
    const token  = document.getElementById("gitlab-token").value;
    const projectName = document.getElementById("project-name").value;

    if (!server || !token) {
        alert("Please provide GitLab server and token.");
        return;
    }

    try {
        const response = await fetch(`${server}/api/v4/projects?search=${encodeURIComponent(projectName)}`, {
            headers: {
                "PRIVATE-TOKEN": token
            }
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);

        const projects = await response.json();
        document.getElementById("project-output").textContent = JSON.stringify(projects, null, 2);

    } catch (err) {
        console.error(err);
        document.getElementById("project-output").textContent = "Error fetching projects: " + err;
    }
});
