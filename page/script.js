class GitLabPanel {
    constructor(panelId) {
        this.panelId = panelId;
        this.panelDivId = panelId+"-panel";
        this.server = "";
        this.token = "";
        this.projectName = "";

        this.serverInput  = document.querySelector(`#${this.panelDivId} input[data-key="server"]`);
        this.tokenInput   = document.querySelector(`#${this.panelDivId} input[data-key="token"]`);
        this.pathInput    = document.querySelector(`#${this.panelDivId} input[data-key="path"]`);
      
        [this.serverInput, this.tokenInput, this.projectInput].forEach(input => {
            if (input) {
                input.addEventListener("input", () => this.updateFromInputs());
                input.addEventListener("change", () => this.saveConfig(input));
            }
        });
    }

    updateFromInputs() {
        this.server = this.serverInput?.value || "";
        this.token = this.tokenInput?.value || "";
        this.projectName = this.projectInput?.value || "";
    }

    updateInputs() {
        if (this.serverInput) this.serverInput.value = this.server;
        if (this.tokenInput) this.tokenInput.value = this.token;
        if (this.projectInput) this.projectInput.value = this.projectName;
    }

    loadFromConfig(config) {
        if (config[this.panelId]) {
            this.server = config[this.panelId].server || "";
            this.token = config[this.panelId].token || "";
            this.projectName = config[this.panelId].project || "";
            this.updateInputs();
        }
    }
    
    saveConfig(input) {
        fetch("save_config.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ panel: input.dataset.panel, key: input.dataset.key, value: input.value })
        })
          .then(res => res.text())
          .then(txt => console.log("Save response:", txt))
          .catch(err => console.error("Save error:", err));
    }

    // Fetch accessible projects from GitLab
    /*async fetchProjects() {
        if (!this.server || !this.token) {
            throw new Error("Server or token missing.");
        }

        const url = `${this.server}/api/v4/projects?search=${encodeURIComponent(this.projectName)}`;
        const res = await fetch(url, {
            headers: { "PRIVATE-TOKEN": this.token }
        });

        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return await res.json();
    }*/
}

var panelLeft;
var panelRight;

function setupPanels() {
    panelLeft  = new GitLabPanel("left");
    panelRight = new GitLabPanel("right");
}

function loadConfig(config) {
    panelLeft.loadFromConfig(config);
    panelRight.loadFromConfig(config);
}

setupPanels();

document.addEventListener("DOMContentLoaded", () => {
  fetch("load_config.php")
    .then(res => res.json())
    .then(config => loadConfig(config))
    .catch(() => console.log("No config yet."));
});

/*function updatePanel() { // TODO
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
});*/
