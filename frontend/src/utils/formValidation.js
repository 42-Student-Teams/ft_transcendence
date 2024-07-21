// Ajoute des écouteurs d'événements sur les champs de saisie pour masquer les erreurs et retirer la classe d'erreur
export function addInputEventListeners(formId, fields) {
    fields.forEach(field => {
        const inputElement = document.getElementById(`${formId}-${field}`);
        if (inputElement) {
            inputElement.addEventListener("input", () => {
                if (inputElement.classList.contains("is-invalid")) {
                    inputElement.classList.remove("is-invalid");
                }
                const errorElement = document.getElementById(`error-${field}`);
                if (errorElement) {
                    errorElement.style.display = "none";
                }
            });
        }
    });
}

// Gère l'événement de soumission du formulaire, effectue la validation et appelle la fonction de rappel de soumission
export function handleEvent(formId, fields, validationCallback, submitCallback) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const data = {};
            fields.forEach(field => {
                const inputElement = document.getElementById(`${formId}-${field}`);
                if (inputElement) {
                    data[field] = inputElement.value;
                }
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
}

// Réinitialise les erreurs de validation sur les champs spécifiés
export function resetErrors(formId, fields) {
    fields.forEach(field => {
        const inputElement = document.getElementById(`${formId}-${field}`);
        if (inputElement) {
            inputElement.classList.remove("is-invalid");
        }
        const errorElement = document.getElementById(`error-${field}`);
        if (errorElement) {
            errorElement.style.display = "none";
        }
    });
}

// Affiche une erreur de validation pour un champ spécifique
export function showError(formId, field) {
    const inputElement = document.getElementById(`${formId}-${field}`);
    if (inputElement) {
        inputElement.classList.add("is-invalid");
    }
    const errorElement = document.getElementById(`error-${field}`);
    if (errorElement) {
        errorElement.style.display = "block";
    }
}
