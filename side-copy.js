const sidebar = document.createElement("div");
sidebar.id = "json-sidebar";
sidebar.classList = "hidden";
document.body.appendChild(sidebar);

const toggleBtn = document.createElement("div");
toggleBtn.id = "json-sidebar-toggle";
toggleBtn.role = "button";
toggleBtn.textContent = "Toggle Sidebar";
document.body.appendChild(toggleBtn);

const filePickerBtn = document.createElement("div");
filePickerBtn.id = "json-folder-picker";
filePickerBtn.textContent = "Choose Folder";
filePickerBtn.role = "button";
document.body.appendChild(filePickerBtn);

const input = document.createElement("input");
input.type = "file";
input.multiple = true;
input.webkitdirectory = true;
input.style.display = "none";
input.accept = ".json";
document.body.appendChild(input);

const dupeCheck = () => {
	``;
	if (chrome.storage.local) {
		chrome.storage.local.get(["sidebarContent"]).then((result) => {
			result.sidebarContent.forEach((file, i, storedFiles) => {
				if (
					Array.from(
						document.querySelectorAll("#json-sidebar > details > summary")
					).some((summary) => summary.innerHTML.includes(file[i].value.name))
				) {
					delete storedFiles[i];
				}
			});

			if (result.sidebarContent) {
				getFiles(false, result.sidebarContent);
			}
		});
	}
};

const generator = async (file, event) => {
	const jsonData = file.status
		? file.value.content
		: JSON.parse(event.target.result);
	const spoiler = document.createElement("details");
	const summary = document.createElement("summary");
	if (
		Array.from(
			document.querySelectorAll("#json-sidebar > details > summary")
		).some((summary) => summary.innerHTML.includes(file.name))
	) {
		console.log("Duplicate found");
	} else {
		summary.textContent = file.status ? file.value.name : file.name;

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
		return { name: file.name, content: jsonData };
	}
};

const getFiles = (event, storedFiles) => {
	return new Promise(async (resolve) => {
		const tempFiles = [];

		const files = storedFiles || (event && event.target.files);

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const reader = new FileReader();

			const result = new Promise((res) => {
				if (!storedFiles) {
					reader.onload = (event) => {
						res(generator(file, event));
					};
				} else {
					res(generator(file));
				}
			});

			!storedFiles && reader.readAsText(file);

			tempFiles.push(result);
		}
		resolve(await Promise.allSettled(tempFiles));
	});
};

toggleBtn.addEventListener("click", () => {
	sidebar.classList.toggle("hidden");
	dupeCheck();
});

filePickerBtn.addEventListener("click", () => {
	input.click();
});

input.addEventListener("change", (event) => {
	getFiles(event).then((storedFiles) => {
		chrome.storage.local.set({
			sidebarContent: storedFiles,
		});
	});
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
		z-index:  calc(9e999);
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
		font-size: 16px !important;
		font-family: Hyperlegible !important;
		font-weight: bold !important;
		mix-blend-mode: difference;
		position: fixed;
		top: 10px;
		right: 10px;
		z-index: calc(9e999);
	}


	#json-folder-picker {
		font-size: 16px !important;
		font-family: Hyperlegible !important;
		font-weight: bold !important;
		mix-blend-mode: difference;
		position: fixed;
		top: 40px;
		right: 10px;
		z-index: calc(9e999);
	}

	#json-sidebar pre {
		background: #fff;
		padding: 10px;
		border-radius: 5px;
		overflow: auto;
	}

	#json-sidebar summary {
		font-size: 16px !important;
		font-family: Hyperlegible !important;
		mix-blend-mode: difference;
		font-weight: bold;
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
	#json-sidebar button:hover {
		background: #3e8e41;
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


`;

document.head.appendChild(style);
