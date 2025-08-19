class GitLabPanel {
    constructor(panelId) {
        this.panelId = panelId;
        this.panelDivId = panelId+"-panel";
        this.server = "";
        this.token = "";
        
	this.projects = [];

        this.serverInput  = document.querySelector(`#${this.panelDivId} input[data-key="server"]`);
        this.tokenInput   = document.querySelector(`#${this.panelDivId} input[data-key="token"]`);
        this.pathInput    = document.querySelector(`#${this.panelDivId} input[data-key="path"]`);
        
        this.filterName   = document.querySelector(`#${this.panelDivId} input[data-key="filter-name"]`);
        this.filterPath   = document.querySelector(`#${this.panelDivId} input[data-key="filter-path"]`);
        this.filters = [this.filterName, this.filterPath];
        
        this.projectsList = document.querySelector(`#${this.panelDivId} div[data-key="projects"]`);
      
        [this.serverInput, this.tokenInput, this.projectInput].forEach(input => {
            if (input) {
                input.addEventListener("input", () => this.updateFromInputs());
                input.addEventListener("change", () => this.saveConfig(input));
            }
        });
        
        this.filters.forEach(input => {
            if (input) {
                input.addEventListener("input", () => this.updateFilter(input));
                //input.addEventListener("change", () => this.updateFilter(input));
            }
        });
        
        this.clearProjects();
    }
    
    checkMatch(a,b) {
    	if (b.length < 3) return true;
	return a.toLowerCase().includes(b.toLowerCase());
    }

    updateFilter(input) {
        this.filters.forEach(other => { if (input != other) other.value = ""; });
        
        var v = input.value;
        
        let filterIndex = 0; // name
        if (input == this.filterPath) filterIndex = 2; // path
        
        console.log("filter", v);
	for (const row of this.projectsList.children) {
		let match = this.checkMatch(row.children[filterIndex].innerHTML, v);
		row.style.display = match ? "flex" : "none";
	}
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
          .then( res => res.text())
          .then( txt => console.log("Save response:", txt))
          .catch(err => console.error("Save error:", err));
    }
    
    addRow(type, cells) {
    	let row = document.createElement('div');
    	row.className = type;
    	this.projectsList.appendChild(row);
    	
    	cells.forEach(cell => {
    		let c = document.createElement('div');
    		row.appendChild(c);
    		c.innerHTML = cell;
    	});
    }
    
    clearProjects() {
    	this.projectsList.innerHTML = "";
    	this.addRow("row header", ["Project", "ID", "Path", "Owner", "Created"]);
    }
    
    addProject(data) {
    	console.log(data);
    	let owner = data["owner"] ? data["owner"]["name"] : "unknown";
    	let path = data["namespace"]["full_path"]
    	this.addRow("row", [data["name"], data["id"], path, owner, data["created_at"]]);
    }

    async fetchProjects() {
        if (!this.server || !this.token) {
            throw new Error("Server or token missing.");
        }
        
        this.clearProjects();
	let page = 1;
	
	while(true) {
		const url = `${this.server}/api/v4/projects?per_page=20&page=${page}`;
		const res = await fetch(url, { headers: { "PRIVATE-TOKEN": this.token } });
		if (!res.ok) throw new Error(`HTTP error ${res.status}`);
		
		let data = await res.json();
		data.forEach(row => { this.addProject(row); });
		
		const nextPage = res.headers.get("X-Next-Page");
		if (!nextPage) break; // no more pages
		page = parseInt(nextPage, 10);
		
		break; // for testing
        }
    }
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

function updatePanel(pID) {
    if (pID == "left") panelLeft.fetchProjects();
    if (pID == "right") panelRight.fetchProjects();
}

setupPanels();

document.addEventListener("DOMContentLoaded", () => {
  fetch("load_config.php")
    .then(res => res.json())
    .then(config => loadConfig(config))
    .catch(() => console.log("No config yet."));
});

// TODO
//  - add name and path filters to filter the projects displayed
//  - when clicking on a project left/right, highlight the same named project on the other side
//  - add stats, total number of projects for example
