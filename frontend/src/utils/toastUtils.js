export function showToast(message, type) {
    if (typeof bootstrap === 'undefined') {
        console.error('Bootstrap is not defined');
        return;
    }

    // Définir l'icône et les classes Bootstrap en fonction du type de toast
    const iconHTML = type === 'success'
        ? '<i class="fas fa-check-circle text-success me-2"></i>'
        : '<i class="fas fa-exclamation-circle text-danger me-2"></i>';

    const toastHTML = `
        <div class="position-fixed top-50 start-50 translate-middle p-3" style="z-index: 1055;">
            <div class="toast align-items-center border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${iconHTML}<span>${message}</span>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        </div>
    `;
    const toastContainer = document.createElement('div');
    toastContainer.innerHTML = toastHTML;
    document.body.appendChild(toastContainer);

    const toastElement = new bootstrap.Toast(toastContainer.querySelector('.toast'));
    toastElement.show();

    setTimeout(() => {
        document.body.removeChild(toastContainer);
    }, 5000);
}
