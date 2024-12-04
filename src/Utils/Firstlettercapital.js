// Select all input elements of type text and all textarea elements
document.querySelectorAll('input[type="text"], textarea').forEach(element => {
    element.addEventListener('input', function () {
        let value = this.value;
        if (value.length > 0) {
            // Capitalize only the first letter and keep the rest unchanged
            this.value = value.charAt(0).toUpperCase() + value.slice(1);
        }
    });
});
