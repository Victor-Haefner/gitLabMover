class GitLabPanel {
    constructor(panelId) {
        this.panelId = panelId;
        this.panelDivId = panelId+"-panel";
        this.server = "";
        this.token = "";
        
	this.projects = [];
        this.path = "";
	
	this.selected = undefined;
	this.highlighted = undefined;

        this.serverInput  = document.querySelector(`#${this.panelDivId} input[data-key="server"]`);
        this.tokenInput   = document.querySelector(`#${this.panelDivId} input[data-key="token"]`);
        this.pathInput    = document.querySelector(`#${this.panelDivId} input[data-key="path"]`);
        
        this.filterName   = document.querySelector(`#${this.panelDivId} input[data-key="filter-name"]`);
        this.filterPath   = document.querySelector(`#${this.panelDivId} input[data-key="filter-path"]`);
        this.filters = [this.filterName, this.filterPath];
        
        this.projectsList = document.querySelector(`#${this.panelDivId} div[data-key="projects"]`);
      
        [this.serverInput, this.tokenInput, this.pathInput].forEach(input => {
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
    
    importProject(pID, pName) {    	
        fetch("import_project.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "projectID": pID, "namespace": this.path, "owner": "victor", "name": pName })
        })
          .then( res => res.text())
          .then( txt => console.log("Import response:", txt))
          .catch(err => console.error("Import error:", err));
    }
    
    exportProject() {
    	if (this.selected == undefined) return;
    	
    	let pID = this.selected.children[1].innerHTML;
    	
        fetch("fetch_project.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "projectID": pID, "token": this.token, "server": this.server })
        })
          .then( res => res.text())
          .then( txt => console.log("Export response:", txt))
          .catch(err => console.error("Export error:", err));
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
        this.pathInput = this.pathInput?.value || "";
    }

    updateInputs() {
        if (this.serverInput) this.serverInput.value = this.server;
        if (this.tokenInput) this.tokenInput.value = this.token;
        if (this.pathInput) this.pathInput.value = this.path;
    }

    loadFromConfig(config) {
    	console.log(config);
        if (config[this.panelId]) {
            this.server = config[this.panelId].server || "";
            this.token = config[this.panelId].token || "";
            this.path = config[this.panelId].path || "";
            this.updateInputs();
        }
    }
    
    saveConfig(input) {
        fetch("save_config.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "panel": input.dataset.panel, "key": input.dataset.key, "value": input.value })
        })
          .then( res => res.text())
          .then( txt => console.log("Save response:", txt))
          .catch(err => console.error("Save error:", err));
    }
    
    findRow(name) {
	for (const row of this.projectsList.children) {
		if (row.children[0].innerHTML == name) return row;
	}
    	return undefined;
    }
    
    otherPanel() {
    	if (this.panelId == "left") return panelRight;
    	if (this.panelId == "right") return panelLeft;
    }
    
    highlightRow(name) {
    	if (this.highlighted != undefined) this.highlighted.classList.remove("highlighted");
    	this.highlighted = this.findRow(name);
    	if (this.highlighted != undefined) {
    		this.highlighted.classList.add("highlighted");
    		this.highlighted.scrollIntoView({ behavior: "auto", block: "nearest" });
    	}
    }
    
    onSelectRow(panel, row) {
    	if (panel.selected != undefined) panel.selected.classList.remove("selected");
    	panel.selected = row;
    	panel.selected.classList.add("selected");
    	let name = row.children[0].innerHTML;
    	let other = panel.otherPanel();
    	other.highlightRow(name);
    }
    
    addRow(type, cells, cb) {
    	let row = document.createElement('div');
    	row.className = type;
    	if (cb) row.onclick = (event) => cb(this, row);
    	this.projectsList.appendChild(row);
    	
    	cells.forEach(cell => {
    		let c = document.createElement('div');
    		row.appendChild(c);
    		c.innerHTML = cell;
    	});
    }
    
    clearProjects() {
    	this.projectsList.innerHTML = "";
    	this.addRow("row header", ["Project", "ID", "Path", "Owner", "Created"], undefined);
    }
    
    addProject(data) {
    	let owner = data["owner"] ? data["owner"]["name"] : "unknown";
    	let path = data["namespace"]["full_path"]
    	this.addRow("row", [data["name"], data["id"], path, owner, data["created_at"]], this.onSelectRow);
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

function exportProject() {
    panelLeft.exportProject();
}

function importProject() {
    if (panelLeft.selected == undefined) return;
    let pName = panelLeft.selected.children[0].innerHTML;
    let pID = panelLeft.selected.children[1].innerHTML;
    panelRight.importProject(pID, pName);
}

setupPanels();

document.addEventListener("DOMContentLoaded", () => {
  fetch("load_config.php")
    .then(res => res.json())
    .then(config => loadConfig(config))
    .catch(() => console.log("No config yet."));
});

// TODO
//  - add project port, maybe a status?
//  - add stats, total number of projects for example




