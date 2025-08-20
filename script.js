const ninDisplay = document.getElementById('nin-display');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const copyMessage = document.getElementById('copy-message');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const body = document.body;
const themeSwitch = document.getElementById('theme-switch');
const pad = (num) => num.toString().padStart(2, '0');

const calculateChecksums = (date, serial) => {
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2, 1];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2, 1];
    const base = date + serial;
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
        sum1 += parseInt(base.charAt(i)) * weights1[i];
    }
    const k1 = (11 - (sum1 % 11)) % 11;
    if (k1 === 10) return null;
    const base2 = base + k1.toString();
    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
        sum2 += parseInt(base2.charAt(i)) * weights2[i];
    }
    const k2 = (11 - (sum2 % 11)) % 11;
    if (k2 === 10) return null;
    return { k1, k2 };
};


const copyToClipboard = async () => {
    try {
        await navigator.clipboard.writeText(ninDisplay.textContent);
        // Show the success message
        copyMessage.style.opacity = '1';
        setTimeout(() => {
            copyMessage.style.opacity = '0';
        }, 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback to a message box if copying fails
        alert('Failed to copy to clipboard. Please copy the number manually.');
    }
};


const generateNIN = () => {
    while (true) {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // Generate a random date within the specified range
        const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
        const randomDate = new Date(randomTimestamp);

        // Extract day, month, and year
        const year = randomDate.getFullYear();
        const month = randomDate.getMonth() + 1;
        const day = randomDate.getDate();

        // Format the date as DDMMYY
        const date = `${pad(day)}${pad(month)}${year.toString().substring(2)}`;

        // Generate a random 3-digit serial number
        const serial = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        // Calculate the checksums
        const checksums = calculateChecksums(date, serial);

        if (checksums) {
            const { k1, k2 } = checksums;
            // Format the full 11-digit NIN with a space separator
            const fullNIN = `${date}${serial}${k1}${k2}`;
            return fullNIN;
        }
    }
};


copyButton.addEventListener('click', copyToClipboard);

generateButton.addEventListener('click', () => {
    const nin = generateNIN();
    ninDisplay.textContent = nin;
});

document.addEventListener('DOMContentLoaded', () => {

    // Set default start date (1971-12-16)
    startDateInput.value = '1971-12-16';

    // Set default end date (today)
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    endDateInput.value = todayFormatted;

    // Set max date for both inputs to today
    startDateInput.max = todayFormatted;
    endDateInput.max = todayFormatted;

    const initialNin = generateNIN();
    ninDisplay.textContent = initialNin;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        const isDark = savedTheme === 'dark';
        themeSwitch.checked = isDark;
        applyTheme(isDark);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        themeSwitch.checked = prefersDark;
        applyTheme(prefersDark);
    }
});


const applyTheme = (isDark) => {
    if (isDark) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }
};


themeSwitch.addEventListener('change', () => {
    const isDark = themeSwitch.checked;
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
