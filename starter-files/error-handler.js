window.onerror = handleError;

function handleError(eventString, source, lineNumber, columnNumber, errorObject) {
    const blackoutElement = document.createElement("div");
    blackoutElement.id = "blackout";
    const preElement = document.createElement("pre");
    preElement.id = "error-message";
    const errorMessage = `
${eventString.replace("Uncaught", "")}

    - Error location: ${source.split("/").pop()}
    - Line number: ${lineNumber}
    - Column number: ${columnNumber}
    `;
    preElement.textContent = errorMessage;

    document.body.prepend(blackoutElement);
    document.body.prepend(preElement);
}