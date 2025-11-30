const TriggerGoogleLoginPopUpBtn = document.querySelector(
  "#trigger-google-login-popup"
);
const FoldersListDiv = document.querySelector("#folders");
const FilesListDiv = document.querySelector("#files");
const FileContentDiv = document.querySelector("#file-content");

let tokenClient;
let currentToken = null;

gapi.load("client", async () => {
  await gapi.client.init({
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ],
  });
});

window.addEventListener("load", () => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id:
      "584382488304-r2kn9ubqm47bmvfs0pr90dbq5eortp4v.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.readonly",
    callback: (tokenResponse) => {
      currentToken = tokenResponse.access_token;
      gapi.client.setToken({
        access_token: currentToken,
      });
      loadFolders("11O13Tc6DFPi0SE-FtW-R2XdHIhZUc-P3");
      laodFile();
    },
  });
});

TriggerGoogleLoginPopUpBtn.onClick(() => {
  tokenClient.requestAccessToken();
});

function accessFolder(folderID) {
  return gapi.client.drive.files.list({
    q: `'${folderID}' in parents`,
    fields: "files(id, name, mimeType)",
  });
}

function accessFile(fileId) {
  return gapi.client.drive.files.get({
    fileId: fileId,
    alt: "media",
  });
}

function loadFolders(folderID) {
  accessFolder(folderID).then((response) => {
    FilesListDiv.innerHTML = "";
    for (const file of response.result.files) {
      if (file.name.startsWith(".")) continue;
      if (folderID == "11O13Tc6DFPi0SE-FtW-R2XdHIhZUc-P3") {
        const folderParagraph = document.createElement("p");
        folderParagraph.classList.add("folder");
        folderParagraph.dataset.folderId = file.id;
        folderParagraph.textContent = `📁 ${file.name}`;
        FoldersListDiv.appendChild(folderParagraph);
      }
      if (file.name.endsWith(".md")) {
        const fileParagraph = document.createElement("p");
        fileParagraph.classList.add("file");
        fileParagraph.dataset.fileId = file.id;
        fileParagraph.textContent = `🗒️ ${file.name}`;
        FilesListDiv.appendChild(fileParagraph);
      }
    }
  });
}

function laodFile(fileId) {
  if (!fileId) return;
  FileContentDiv.innerHTML = "Loading content...";
  accessFile(fileId).then((response) => {
    const fileContent = response.body;
    const html = marked.parse(fileContent);
    FileContentDiv.innerHTML = html;
  });
}

FoldersListDiv.addEventListener("click", (e) => {
  const folder = e.target.closest(".folder");
  if (!folder) return;
  const folderId = folder.dataset.folderId;
  loadFolders(folderId);
});

FilesListDiv.addEventListener("click", (e) => {
  const file = e.target.closest(".file");
  if (!file) return;
  const fileId = file.dataset.fileId;
  laodFile(fileId);
});
