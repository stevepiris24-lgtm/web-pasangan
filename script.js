/* =====================================================
   UNTUK LILA ❤️
   SCRIPT.JS FINAL
   Sesuai index.html terbaru
===================================================== */


/* =====================================================
   1. SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://lzuqaqysqmavxxstifjy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_XAbDjSXAHywqAGJ4eWz3OA_iO5PDNiF";

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =====================================================
   2. SUPABASE CLIENT
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   3. GLOBAL STATE
===================================================== */

let currentUser = null;

let currentAlbumId = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =====================================================
   4. TANGGAL HUBUNGAN
===================================================== */

const relationshipStartDate =
    new Date(
        "2024-04-24T00:00:00"
    );


/* =====================================================
   5. TEKS ROMANTIS
===================================================== */

const romanticTexts = [

    "Setiap hari bersamamu adalah rumah.",

    "Kamu adalah tempat pulang terbaikku.",

    "Bersamamu, semua terasa cukup.",

    "Aku memilihmu setiap hari ❤️",

    "Kita, selamanya bukan sekadar kata.",

    "Bersamamu, hari biasa terasa begitu istimewa.",

    "Kamu adalah bagian terindah dari setiap hariku.",

    "Di mana pun kita berada, bersamamu selalu terasa seperti rumah.",

    "Aku tidak membutuhkan tempat yang sempurna, selama ada kamu.",

    "Terima kasih sudah menjadi bagian dari cerita hidupku.",

    "Bersamamu, aku menemukan alasan untuk selalu tersenyum.",

    "Kalau ada satu tempat yang ingin selalu aku tuju, itu adalah kamu.",

    "Aku ingin terus mengumpulkan kenangan kecil bersamamu.",

    "Semoga cerita kita terus bertambah indah setiap harinya.",

    "Bukan tentang seberapa sempurna kita, tetapi tentang bagaimana kita tetap bersama.",

    "Kamu membuat setiap perjalanan terasa lebih berarti.",

    "Hari-hari bersamamu adalah halaman favorit dalam hidupku.",

    "Aku ingin melihat lebih banyak matahari terbit dan terbenam bersamamu.",

    "Selama ada kamu, aku tidak takut dengan perjalanan panjang.",

    "Aku ingin tetap menjadi bagian dari cerita kamu.",

    "Kita mungkin sederhana, tapi kenangan kita luar biasa.",

    "Ada banyak hal yang bisa berubah, tapi semoga kita tetap memilih satu sama lain.",

    "Terima kasih telah hadir dan membuat hidupku terasa lebih hangat.",

    "Aku ingin terus menulis cerita kita, satu hari demi satu hari.",

    "Jika waktu bisa berhenti, aku ingin berhenti di salah satu momen bersama kamu. ❤️",

    "Tidak semua rumah berupa tempat, terkadang rumah adalah seseorang.",

    "Dan bagiku, rumah itu adalah kamu. ❤️"

];


let romanticTextIndex = 0;


/* =====================================================
   6. ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================================
   7. FORMAT TANGGAL
===================================================== */

function formatTanggal(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(
            value.includes("T")
                ? value
                : `${value}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;

    }


    return date.toLocaleDateString(

        "id-ID",

        {

            day: "numeric",

            month: "long",

            year: "numeric"

        }

    );

}


/* =====================================================
   8. FORMAT JUMLAH FOTO
===================================================== */

function formatJumlahFoto(jumlah) {

    const total =
        Number(jumlah) || 0;


    if (total === 1) {

        return "1 foto";

    }


    return `${total} foto`;

}


/* =====================================================
   9. BUAT ID/NAMA FILE AMAN
===================================================== */

function createSafeFileName(file) {

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    let uniqueId;


    if (
        window.crypto &&
        typeof window.crypto.randomUUID ===
        "function"
    ) {

        uniqueId =
            window.crypto.randomUUID();

    } else {

        uniqueId =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2);

    }


    return `${uniqueId}.${extension}`;

}


/* =====================================================
   10. SHOW TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timeout
    );


    showToast.timeout =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =====================================================
   11. UPDATE WAKTU BERSAMA
===================================================== */

function updateTogetherTime() {

    const now =
        new Date();


    const difference =
        now.getTime() -
        relationshipStartDate.getTime();


    if (difference < 0) {

        return;

    }


    const days =
        Math.floor(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    const hours =
        Math.floor(
            difference /
            (
                1000 *
                60 *
                60
            )
        );


    const daysElement =
        document.getElementById(
            "daysTogether"
        );


    const hoursElement =
        document.getElementById(
            "hoursTogether"
        );


    const startDateText =
        document.getElementById(
            "startDateText"
        );


    if (daysElement) {

        daysElement.textContent =
            days.toLocaleString(
                "id-ID"
            );

    }


    if (hoursElement) {

        hoursElement.textContent =
            hours.toLocaleString(
                "id-ID"
            ) +
            " jam bersama";

    }


    if (startDateText) {

        startDateText.textContent =
            "24 April 2024";

    }

}


/* =====================================================
   12. TEKS BERGANTI
===================================================== */

function changeRomanticText() {

    const heroTitle =
        document.querySelector(
            ".hero-content h1"
        );


    const quote =
        document.querySelector(
            ".quote-card p"
        );


    if (!heroTitle) {

        return;

    }


    romanticTextIndex++;


    if (
        romanticTextIndex >=
        romanticTexts.length
    ) {

        romanticTextIndex = 0;

    }


    const text =
        romanticTexts[
            romanticTextIndex
        ];


    heroTitle.style.opacity =
        "0";


    setTimeout(
        function () {

            heroTitle.textContent =
                text;


            heroTitle.style.opacity =
                "1";


            if (quote) {

                quote.textContent =
                    text;

            }

        },
        400
    );

}


/* =====================================================
   13. OPEN LOGIN MODAL
===================================================== */

function openLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "show"
    );


    const emailInput =
        document.getElementById(
            "loginEmail"
        );


    setTimeout(
        function () {

            emailInput?.focus();

        },
        100
    );

}


/* =====================================================
   14. CLOSE LOGIN MODAL
===================================================== */

function closeLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (message) {

        message.textContent =
            "";

    }

}


/* =====================================================
   15. LOGIN ADMIN
===================================================== */

async function loginAdmin(event) {

    if (event) {

        event.preventDefault();

    }


    const emailInput =
        document.getElementById(
            "loginEmail"
        );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const message =
        document.getElementById(
            "loginMessage"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        return;

    }


    const email =
        emailInput.value
            .trim();


    const password =
        passwordInput.value;


    if (
        !email ||
        !password
    ) {

        if (message) {

            message.textContent =
                "Email dan password wajib diisi.";

        }


        return;

    }


    if (message) {

        message.textContent =
            "Sedang masuk...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword(
                    {

                        email:
                            email,

                        password:
                            password

                    }
                );


        if (error) {

            throw error;

        }


        currentUser =
            data.user;


        if (message) {

            message.textContent =
                "Login berhasil ❤️";

        }


        passwordInput.value =
            "";


        updateAdminUI();


        setTimeout(
            function () {

                closeLoginModal();

            },
            500
        );


        showToast(
            "Login admin berhasil ❤️"
        );


        await loadAlbums();

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        if (message) {

            message.textContent =
                "Login gagal: " +
                (
                    error.message ||
                    "Periksa email dan password."
                );

        }

    }

}


/* =====================================================
   16. LOGOUT
===================================================== */

async function logoutAdmin() {

    try {

        await supabaseClient
            .auth
            .signOut();


        currentUser =
            null;


        updateAdminUI();


        showToast(
            "Berhasil logout."
        );


        await loadAlbums();

    }

    catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

    }

}


/* =====================================================
   17. CEK SESSION
===================================================== */

async function checkLogin() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            throw error;

        }


        currentUser =
            data.session?.user ||
            null;


        updateAdminUI();

    }

    catch (error) {

        console.error(
            "CHECK LOGIN ERROR:",
            error
        );


        currentUser =
            null;


        updateAdminUI();

    }

}


/* =====================================================
   18. UPDATE ADMIN UI
===================================================== */

function updateAdminUI() {

    const adminButton =
        document.getElementById(
            "adminButton"
        );


    const addAlbumButton =
        document.getElementById(
            "addAlbumButton"
        );


    const addTimelineButton =
        document.getElementById(
            "addTimelineButton"
        );


    if (currentUser) {

        if (adminButton) {

            adminButton.textContent =
                "Logout";

        }


        if (addAlbumButton) {

            addAlbumButton.style.display =
                "";

        }


        if (addTimelineButton) {

            addTimelineButton.style.display =
                "";

        }

    } else {

        if (adminButton) {

            adminButton.textContent =
                "Admin";

        }


        /*
            Tombol tetap boleh terlihat,
            tetapi jika diklik akan diarahkan
            ke login.
        */

        if (addAlbumButton) {

            addAlbumButton.style.display =
                "";

        }


        if (addTimelineButton) {

            addTimelineButton.style.display =
                "";

        }

    }

}


/* =====================================================
   19. AUTH STATE CHANGE
===================================================== */

supabaseClient
    .auth
    .onAuthStateChange(
        function (
            event,
            session
        ) {

            currentUser =
                session?.user ||
                null;


            updateAdminUI();

        }
    );


/* =====================================================
   20. ADMIN BUTTON
===================================================== */

function handleAdminButton() {

    if (currentUser) {

        logoutAdmin();

    } else {

        openLoginModal();

    }

}


/* =====================================================
   END BAGIAN 1
===================================================== */