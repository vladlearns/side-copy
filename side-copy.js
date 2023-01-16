const sidebar = document.createElement("div");
sidebar.id = "json-sidebar";
sidebar.classList = "hidden";
document.body.appendChild(sidebar);

const toggleBtn = document.createElement("button");
toggleBtn.id = "json-sidebar-toggle";
toggleBtn.textContent = "Toggle Sidebar";
document.body.appendChild(toggleBtn);

const filePickerBtn = document.createElement("button");
filePickerBtn.id = "json-folder-picker";
filePickerBtn.textContent = "Choose Folder";
filePickerBtn.classList = "btn-choose-folder";
document.body.appendChild(filePickerBtn);

const input = document.createElement("input");
input.type = "file";
input.multiple = true;
input.webkitdirectory = true;
input.style.display = "none";
input.accept = ".json";
document.body.appendChild(input);

filePickerBtn.addEventListener("click", () => {
	input.click();
});

input.addEventListener("change", (event) => {
	const files = event.target.files;
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const reader = new FileReader();
		reader.onload = (event) => {
			const jsonData = JSON.parse(event.target.result);
			const spoiler = document.createElement("details");
			const summary = document.createElement("summary");
			summary.textContent = file.name;
			spoiler.appendChild(summary);

			// Recursively loop through the json object and add each property to the sidebar
			function addProperties(obj, parent) {
				for (let key in obj) {
					if (obj.hasOwnProperty(key)) {
						if (!Array.isArray(obj[key]) && typeof obj[key] === "object") {
							const subSpoiler = document.createElement("details");
							const subSummary = document.createElement("summary");
							subSummary.textContent = key;
							subSpoiler.appendChild(subSummary);
							parent.appendChild(subSpoiler);
							addProperties(obj[key], subSpoiler);
						} else if (Array.isArray(obj[key])) {
							const property = document.createElement("div");
							property.textContent = `${key} : ${JSON.stringify(
								obj[key],
								null,
								4
							)}`;
							const copyBtn = document.createElement("button");
							copyBtn.textContent = "Copy to clipboard";
							copyBtn.addEventListener("click", () => {
								navigator.clipboard.writeText(obj[key]);
							});
							property.appendChild(copyBtn);
							parent.appendChild(property);
						} else {
							const property = document.createElement("div");
							property.textContent = `${key}: ${obj[key]}`;
							const copyBtn = document.createElement("button");
							copyBtn.textContent = "Copy to clipboard";
							copyBtn.addEventListener("click", () => {
								navigator.clipboard.writeText(obj[key]);
							});
							property.appendChild(copyBtn);
							parent.appendChild(property);
						}
					}
				}
			}
			addProperties(jsonData, spoiler);
			sidebar.appendChild(spoiler);
		};
		reader.readAsText(file);
	}
});

toggleBtn.addEventListener("click", () => {
	sidebar.classList.toggle("hidden");
});

const style = document.createElement("style");
style.innerHTML = `
    #json-sidebar {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 30%;
		background-color: rgb(30, 32, 33, .5);
		overflow-y: auto;
		padding: 10px;
		z-index: 1;
		resize: both;
		overflow: auto;
	  }
	  @media (max-width: 600px) {
		#json-sidebar {
		  width: 100%;
		  height: 100%;
		  left: 0;
		}
	  }
	  #json-sidebar.hidden {
		display: none;
	  }
	  #json-sidebar-toggle {
		position: fixed;
		top: 10px;
		right: 10px;
		z-index: 1;
	  }
	  #json-folder-picker {
		position: fixed;
		top: 40px;
		right: 10px;
		z-index: 1;
	  }

	  #json-sidebar pre {
	  background: #fff;
	  padding: 10px;
	  border-radius: 5px;
	  overflow: auto;
	  }
  
	
	  #json-sidebar summary {
	  font-weight: bold;
	  cursor: pointer;
	  }
  

	  #toggle-btn {
	  position: fixed;
	  top: 20px;
	  left: 20px;
	  padding: 10px 20px;
	  background: #fff;
	  border-radius: 5px;
	  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	  cursor: pointer;
	  }
  

	  #json-sidebar button {
	  margin-top: 10px;
	  padding: 5px 10px;
	  background: #4CAF50;
	  color: #fff;
	  border-radius: 5px;
	  cursor: pointer;
	  }
  

	  #
	  #json-sidebar button:hover {
		  background: #3e8e41;
	  }
	  
	  @keyframes slideIn {
		  from {transform: translateX(-100%);}
		  to {transform: translateX(0);}
	  }
	  
	  #json-sidebar.open {
		  animation: slideIn 0.5s ease-in-out forwards;
	  }

	  #json-sidebar div {
		  position: relative;
		  padding: 10px;
		  border: 1px solid #ccc;
		  border-radius: 10px;
		  margin-bottom: 45px;
	  }
	  
	  #json-sidebar div button {
		  position: absolute;
		  bottom: -40px;
		  right: 10px;
	  }
	  
	  #toggle-btn {
		  z-index: 1;
	  }
	  
	  #btn-choose-folder {
		  z-index: 1;
	  }
	  
	`;
document.head.appendChild(style);
