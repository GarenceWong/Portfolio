document.addEventListener('DOMContentLoaded', function () {
    const toggleModeButton = document.getElementById('toggle-mode');
    const modeIcon = document.getElementById('mode-icon');
    
    // Function to update the mode based on the current mode
    function updateMode() {
        if (document.body.classList.contains('dark-mode')) {
            modeIcon.src = 'Resources/lightmode.png';
            localStorage.setItem('theme', 'dark');
        } else {
            modeIcon.src = 'Resources/darkmode.png';
            localStorage.setItem('theme', 'light');
        }
    }

    // Load initial mode based on user preference or default
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateMode();

    // Event listener for toggle mode button
    toggleModeButton.addEventListener('click', function (event) {
        event.preventDefault();
        document.body.classList.toggle('dark-mode');
        updateMode();
    });
});




