export function showToast(message, type) {
    // Bootstrap toast centered in the page
    const toastHTML = `
        <div class="position-fixed top-50 start-50 translate-middle p-3" style="z-index: 1055;">
            <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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