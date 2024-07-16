export function addInputEventListeners(formId, fields) {
    fields.forEach(field => {
        const inputElement = document.getElementById(`${formId}-${field}`);
        inputElement.addEventListener("input", () => {
            if (inputElement.classList.contains("is-invalid")) {
                inputElement.classList.remove("is-invalid");
            }
            const errorElement = document.getElementById(`error-${field}`);
            errorElement.style.display = "none";
        });
    });
}

export function handleEvent(formId, fields, validationCallback, submitCallback) {
    const form = document.getElementById(formId);
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const data = {};
        fields.forEach(field => {
            data[field] = document.getElementById(`${formId}-${field}`).value;
        });

        resetErrors(formId, fields);

        let hasError = false;
        fields.forEach(field => {
            if (!validationCallback(field, data[field])) {
                showError(formId, field);
                hasError = true;
            }
        });

        if (hasError) return;

        await submitCallback(data);
    });
}

export function resetErrors(formId, fields) {
    fields.forEach(field => {
        const inputElement = document.getElementById(`${formId}-${field}`);
        inputElement.classList.remove("is-invalid");
        const errorElement = document.getElementById(`error-${field}`);
        errorElement.style.display = "none";
    });
}

export function showError(formId, field) {
    const inputElement = document.getElementById(`${formId}-${field}`);
    inputElement.classList.add("is-invalid");
    const errorElement = document.getElementById(`error-${field}`);
    errorElement.style.display = "block";
}
