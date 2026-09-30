/* =====================================================
   UNTUK LILA
   SCRIPT.JS - FINAL VERSION
   SUPABASE ALBUM SYSTEM
===================================================== */


/* =====================================================
   1. SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";

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

let currentAlbum = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =====================================================
   4. HERO TEXT
===================================================== */

const heroTexts = [
    "Setiap hari bersamamu adalah rumah.",
    "Bersamamu, semua terasa cukup.",
    "Kita mungkin sederhana, tapi cerita kita istimewa.",
    "Terima kasih sudah menjadi bagian dari hidupku.",
    "Semoga cerita kita selalu punya halaman baru.",
    "Aku suka semua cerita yang melibatkan kita.",
    "Dari sekian banyak tempat, rumahku tetap kamu.",
    "Kalau ada kamu, semuanya terasa lebih baik."
];

let heroTextIndex = 0;


function changeHeroText() {

    const element =
        document.getElementById("heroTitle");

    if (!element) {
        return;
    }

    element.style.opacity = "0";

    setTimeout(() => {

        heroTextIndex++;

        if (
            heroTextIndex >=
            heroTexts.length
        ) {
            heroTextIndex = 0;
        }

        element.textContent =
            heroTexts[heroTextIndex];

        element.style.opacity = "1";

    }, 450);
}


setInterval(
    changeHeroText,
    5000
);


/* =====================================================
   5. UTILITY
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   6. FORMAT DATE
===================================================== */

function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }

    /*
        Hindari masalah timezone.
        Kita ambil YYYY-MM-DD langsung.
    */

    const parts =
        String(dateValue)
            .substring(0, 10)
            .split("-");

    if (parts.length !== 3) {
        return escapeHTML(dateValue);
    }

    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);

    if (
        !year ||
        !month ||
        !day
    ) {
        return escapeHTML(dateValue);
    }

    const date =
        new Date(
            year,
            month - 1,
            day
        );

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
   7. MESSAGE
===================================================== */

function showMessage(
    elementId,
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "form-message " +
        type;
}


/* =====================================================
   8. TIME TOGETHER
===================================================== */

function updateTimeTogether() {

    const startDate =
        new Date(
            "2024-04-24T00:00:00"
        );

    const now =
        new Date();

    const difference =
        now.getTime() -
        startDate.getTime();

    if (difference < 0) {
        return;
    }

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );

    const daysElement =
        document.getElementById(
            "daysTogether"
        );

    const hoursElement =
        document.getElementById(
            "hoursTogether"
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
            );
    }
}


updateTimeTogether();


setInterval(
    updateTimeTogether,
    60000
);


/* =====================================================
   9. LOGIN MODAL
===================================================== */

function openLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        document
            .getElementById(
                "loginEmail"
            )
            ?.focus();

    }, 100);
}


function closeLoginModal() {

    document
        .getElementById(
            "loginModal"
        )
        ?.classList
        .add("hidden");
}


/* =====================================================
   10. LOGIN ADMIN
===================================================== */

async function loginAdmin(event) {

    event.preventDefault();

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    if (
        !emailInput ||
        !passwordInput
    ) {
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    showMessage(
        "loginMessage",
        "Sedang masuk...",
        "info"
    );

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {
            throw new Error(
                error.message
            );
        }

        currentUser =
            data.user;

        closeLoginModal();

        updateAdminUI();

        await loadAlbums();

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        showMessage(
            "loginMessage",
            "Login gagal: " +
            error.message
        );
    }
}


/* =====================================================
   11. LOGOUT
===================================================== */

async function logoutAdmin() {

    try {

        await supabaseClient
            .auth
            .signOut();

        currentUser = null;

        currentAlbum = null;

        updateAdminUI();

        closeAlbumViewer();

        await loadAlbums();

    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );
    }
}


/* =====================================================
   12. CHECK SESSION
===================================================== */

async function checkLogin() {

    try {

        const {
            data
        } =
            await supabaseClient
                .auth
                .getSession();

        currentUser =
            data.session?.user ||
            null;

        updateAdminUI();

    } catch (error) {

        console.error(
            "SESSION ERROR:",
            error
        );

        currentUser = null;

        updateAdminUI();
    }
}


/* =====================================================
   13. UPDATE ADMIN UI
===================================================== */

function updateAdminUI() {

    const adminButton =
        document.getElementById(
            "adminButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const addAlbumButton =
        document.getElementById(
            "addAlbumButton"
        );

    if (currentUser) {

        adminButton
            ?.classList
            .add("hidden");

        logoutButton
            ?.classList
            .remove("hidden");

        addAlbumButton
            ?.classList
            .remove("hidden");

    } else {

        adminButton
            ?.classList
            .remove("hidden");

        logoutButton
            ?.classList
            .add("hidden");

        addAlbumButton
            ?.classList
            .add("hidden");
    }
}


/* =====================================================
   14. AUTH STATE LISTENER
===================================================== */

supabaseClient.auth.onAuthStateChange(
    (_event, session) => {

        currentUser =
            session?.user ||
            null;

        updateAdminUI();
    }
);


/* =====================================================
   15. LOAD ALBUMS
===================================================== */

async function loadAlbums() {

    const list =
        document.getElementById(
            "timelineList"
        );

    if (!list) {
        return;
    }

    list.innerHTML = `
        <div class="loading">
            <div class="loading-heart">
                ❤️
            </div>

            <p>
                Memuat cerita kita...
            </p>
        </div>
    `;

    try {

        /*
            HANYA gunakan kolom yang
            memang ada di tabel albums.

            Tidak menggunakan:
            cover_path
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("albums")
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url"
                )
                .order(
                    "tanggal",
                    {
                        ascending: true
                    }
                );

        if (error) {
            throw new Error(
                error.message
            );
        }

        albumsCache =
            data || [];

        await renderAlbums(
            albumsCache
        );

    } catch (error) {

        console.error(
            "LOAD ALBUM ERROR:",
            error
        );

        list.innerHTML = `
            <div class="empty-state error-state">

                <strong>
                    Gagal memuat album
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}


/* =====================================================
   16. GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    try {

        /*
            PENTING:

            HANYA mengambil:
            id
            album_id
            foto_url
            created_at

            TIDAK menggunakan foto_path.
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("album_photos")
                .select(
                    "id,album_id,foto_url,created_at"
                )
                .eq(
                    "album_id",
                    albumId
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "LOAD PHOTO ERROR:",
                error
            );

            return [];
        }

        return data || [];

    } catch (error) {

        console.error(
            "GET PHOTOS ERROR:",
            error
        );

        return [];
    }
}


/* =====================================================
   17. RENDER ALBUMS
===================================================== */

async function renderAlbums(
    albums
) {

    const list =
        document.getElementById(
            "timelineList"
        );

    if (!list) {
        return;
    }

    if (!albums.length) {

        list.innerHTML = `
            <div class="empty-state">

                <div class="empty-heart">
                    ❤️
                </div>

                <strong>
                    Belum ada cerita
                </strong>

                <p>
                    Login sebagai admin
                    untuk membuat album pertama.
                </p>

            </div>
        `;

        return;
    }

    list.innerHTML = "";

    /*
        Kita ambil foto setiap album
        untuk mendapatkan cover.

        Promise.all membuat proses
        lebih cepat dibanding satu per satu.
    */

    const albumCards =
        await Promise.all(

            albums.map(
                async album => {

                    const photos =
                        await getAlbumPhotos(
                            album.id
                        );

                    const firstPhoto =
                        photos.length > 0
                            ? photos[0].foto_url
                            : (
                                album.cover_url ||
                                ""
                            );

                    return {
                        album,
                        firstPhoto,
                        photoCount:
                            photos.length
                    };
                }
            )
        );


    albumCards.forEach(
        ({
            album,
            firstPhoto,
            photoCount
        }) => {

            const item =
                document.createElement(
                    "article"
                );

            item.className =
                "timeline-item";


            const title =
                album.title ||
                "Tanpa Judul";


            item.innerHTML = `
                <div class="timeline-dot"></div>

                <div class="timeline-card">

                    <div class="timeline-cover-wrapper">

                        ${
                            firstPhoto
                            ?
                            `
                            <img
                                class="timeline-cover"
                                src="${escapeHTML(
                                    firstPhoto
                                )}"
                                alt="${escapeHTML(
                                    title
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.parentElement.classList.add('no-image');
                                "
                            >
                            `
                            :
                            `
                            <div class="timeline-cover-placeholder">
                                ❤️
                            </div>
                            `
                        }

                        ${
                            photoCount > 0
                            ?
                            `
                            <div class="photo-count">
                                📷 ${photoCount}
                            </div>
                            `
                            :
                            ""
                        }

                    </div>


                    <div class="timeline-body">

                        <div class="timeline-date">
                            ${formatTanggal(
                                album.tanggal
                            )}
                        </div>


                        <h3 class="timeline-title">
                            ${escapeHTML(
                                title
                            )}
                        </h3>


                        ${
                            album.lokasi
                            ?
                            `
                            <div class="timeline-location">
                                📍
                                ${escapeHTML(
                                    album.lokasi
                                )}
                            </div>
                            `
                            :
                            ""
                        }


                        ${
                            album.cerita
                            ?
                            `
                            <div class="timeline-story">
                                ${escapeHTML(
                                    album.cerita
                                )}
                            </div>
                            `
                            :
                            ""
                        }


                        <div class="timeline-actions">

                            <button
                                class="primary-button"
                                onclick="openAlbum('${escapeHTML(
                                    album.id
                                )}')"
                            >
                                Buka Album ❤️
                            </button>


                            ${
                                currentUser
                                ?
                                `
                                <button
                                    class="secondary-button"
                                    onclick="hapusAlbum('${escapeHTML(
                                        album.id
                                    )}')"
                                >
                                    Hapus Album
                                </button>
                                `
                                :
                                ""
                            }

                        </div>

                    </div>

                </div>
            `;


            list.appendChild(
                item
            );
        }
    );
}


/* =====================================================
   18. OPEN ALBUM
===================================================== */

async function openAlbum(
    albumId
) {

    const viewer =
        document.getElementById(
            "albumViewer"
        );

    const content =
        document.getElementById(
            "albumViewerContent"
        );

    if (!viewer || !content) {
        return;
    }

    viewer.classList.remove(
        "hidden"
    );

    content.innerHTML = `
        <div class="loading">

            <div class="loading-heart">
                ❤️
            </div>

            <p>
                Membuka album...
            </p>

        </div>
    `;

    try {

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url"
                )
                .eq(
                    "id",
                    albumId
                )
                .single();

        if (albumError) {

            throw new Error(
                albumError.message
            );
        }

        const photos =
            await getAlbumPhotos(
                albumId
            );

        currentAlbum =
            album;

        albumPhotosCache =
            photos;

        renderAlbumViewer(
            album,
            photos
        );

    } catch (error) {

        console.error(
            "OPEN ALBUM ERROR:",
            error
        );

        content.innerHTML = `
            <div class="empty-state error-state">

                <strong>
                    Gagal membuka album
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
        `;
    }
}


/* =====================================================
   19. RENDER ALBUM VIEWER
===================================================== */

function renderAlbumViewer(
    album,
    photos
) {

    const content =
        document.getElementById(
            "albumViewerContent"
        );

    if (!content) {
        return;
    }

    const title =
        album.title ||
        "Tanpa Judul";


    const cover =
        album.cover_url ||
        (
            photos.length
                ? photos[0].foto_url
                : ""
        );


    content.innerHTML = `
        <div class="album-viewer-header">

            ${
                cover
                ?
                `
                <div class="album-viewer-cover">

                    <img
                        src="${escapeHTML(
                            cover
                        )}"
                        alt="${escapeHTML(
                            title
                        )}"
                    >

                </div>
                `
                :
                ""
            }


            <div class="album-viewer-date">
                ${formatTanggal(
                    album.tanggal
                )}
            </div>


            <h2>
                ${escapeHTML(
                    title
                )}
            </h2>


            ${
                album.lokasi
                ?
                `
                <div class="album-viewer-location">
                    📍
                    ${escapeHTML(
                        album.lokasi
                    )}
                </div>
                `
                :
                ""
            }


            ${
                album.cerita
                ?
                `
                <div class="album-viewer-story">
                    ${escapeHTML(
                        album.cerita
                    )}
                </div>
                `
                :
                ""
            }

        </div>


        <div class="album-toolbar">

            <div>

                <h3>
                    Foto Kenangan
                </h3>

                <span>
                    ${photos.length}
                    foto
                </span>

            </div>


            ${
                currentUser
                ?
                `
                <div>

                    <button
                        class="primary-button"
                        onclick="triggerAddPhotos()"
                    >
                        + Tambahkan Foto
                    </button>

                    <input
                        id="additionalPhotos"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onchange="addPhotosToCurrentAlbum(event)"
                    >

                </div>
                `
                :
                ""
            }

        </div>


        <div class="album-photo-grid">

            ${
                photos.length
                ?
                photos
                    .map(
                        photo => {

                            return `
                                <div
                                    class="album-photo-item"
                                >

                                    <img
                                        src="${escapeHTML(
                                            photo.foto_url
                                        )}"
                                        alt="Foto kenangan"
                                        onclick="previewPhoto('${escapeHTML(
                                            photo.foto_url
                                        )}')"
                                        loading="lazy"
                                    >


                                    ${
                                        currentUser
                                        ?
                                        `
                                        <button
                                            class="delete-photo-button"
                                            onclick="hapusFotoAlbum(
                                                '${escapeHTML(
                                                    photo.id
                                                )}',
                                                '${escapeHTML(
                                                    photo.foto_url
                                                )}'
                                            )"
                                            title="Hapus foto"
                                        >
                                            ×
                                        </button>
                                        `
                                        :
                                        ""
                                    }

                                </div>
                            `;
                        }
                    )
                    .join("")
                :
                `
                <div
                    class="empty-state"
                    style="grid-column:1/-1"
                >

                    <div class="empty-heart">
                        📷
                    </div>

                    <strong>
                        Belum ada foto
                    </strong>

                    <p>
                        ${
                            currentUser
                            ?
                            "Klik Tambahkan Foto untuk menambahkan kenangan."
                            :
                            "Album ini belum memiliki foto."
                        }
                    </p>

                </div>
                `
            }

        </div>
    `;
}


/* =====================================================
   20. CLOSE ALBUM VIEWER
===================================================== */

function closeAlbumViewer() {

    document
        .getElementById(
            "albumViewer"
        )
        ?.classList
        .add("hidden");

    currentAlbum =
        null;

    albumPhotosCache =
        [];
}


/* =====================================================
   21. PREVIEW PHOTO
===================================================== */

function previewPhoto(
    url
) {

    if (!url) {
        return;
    }

    const win =
        window.open(
            "",
            "_blank"
        );

    if (!win) {
        alert(
            "Browser memblokir jendela baru."
        );

        return;
    }

    const safeURL =
        escapeHTML(url);

    win.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Foto Kenangan ❤️
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    background: #050507;
                }

                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 25px;
                }

                img {
                    max-width: 95vw;
                    max-height: 92vh;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 18px;
                    box-shadow:
                        0 20px 80px
                        rgba(255, 70, 130, .25);
                }

            </style>

        </head>

        <body>

            <img
                src="${safeURL}"
                alt="Foto Kenangan"
            >

        </body>

        </html>
    `);

    win.document.close();
}


/* =====================================================
   22. ADD ALBUM MODAL
===================================================== */

function openAddAlbumModal() {

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const modal =
        document.getElementById(
            "albumModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

    /*
        Set tanggal default
        hanya kalau masih kosong.
    */

    const dateInput =
        document.getElementById(
            "albumDate"
        );

    if (
        dateInput &&
        !dateInput.value
    ) {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");

        dateInput.value =
            `${year}-${month}-${day}`;
    }
}


/* =====================================================
   23. CLOSE ADD ALBUM MODAL
===================================================== */

function closeAddAlbumModal() {

    document
        .getElementById(
            "albumModal"
        )
        ?.classList
        .add("hidden");

    const form =
        document.getElementById(
            "albumForm"
        );

    if (form) {
        form.reset();
    }

    const preview =
        document.getElementById(
            "albumPreview"
        );

    if (preview) {
        preview.innerHTML = "";
    }

    showMessage(
        "albumMessage",
        "",
        "info"
    );
}


/* =====================================================
   24. PREVIEW ALBUM PHOTOS
===================================================== */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "albumPhotos"
        ) {
            return;
        }

        const preview =
            document.getElementById(
                "albumPreview"
            );

        if (!preview) {
            return;
        }

        preview.innerHTML = "";

        const files =
            Array.from(
                event.target.files || []
            );

        if (!files.length) {
            return;
        }

        files.forEach(
            (file, index) => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {
                    return;
                }

                const reader =
                    new FileReader();

                reader.onload =
                    readerEvent => {

                        const item =
                            document.createElement(
                                "div"
                            );

                        item.className =
                            "photo-preview-item";

                        item.innerHTML = `
                            <img
                                src="${readerEvent.target.result}"
                                alt="Preview ${index + 1}"
                            >

                            ${
                                index === 0
                                ?
                                `
                                <span class="cover-badge">
                                    COVER
                                </span>
                                `
                                :
                                ""
                            }
                        `;

                        preview.appendChild(
                            item
                        );
                    };

                reader.readAsDataURL(
                    file
                );
            }
        );
    }
);


/* =====================================================
   25. CREATE ALBUM
===================================================== */

async function tambahAlbum(
    event
) {

    if (event) {
        event.preventDefault();
    }

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const titleInput =
        document.getElementById(
            "albumTitle"
        );

    const dateInput =
        document.getElementById(
            "albumDate"
        );

    const locationInput =
        document.getElementById(
            "albumLocation"
        );

    const storyInput =
        document.getElementById(
            "albumStory"
        );

    const photoInput =
        document.getElementById(
            "albumPhotos"
        );

    const button =
        document.getElementById(
            "saveAlbumButton"
        );


    if (
        !titleInput ||
        !dateInput ||
        !locationInput ||
        !storyInput
    ) {
        return;
    }


    const title =
        titleInput.value.trim();

    const tanggal =
        dateInput.value;

    const lokasi =
        locationInput.value.trim();

    const cerita =
        storyInput.value.trim();

    const files =
        Array.from(
            photoInput?.files || []
        );


    if (!title) {

        showMessage(
            "albumMessage",
            "Nama album wajib diisi."
        );

        return;
    }


    if (!tanggal) {

        showMessage(
            "albumMessage",
            "Tanggal album wajib diisi."
        );

        return;
    }


    /*
        Batasi ukuran foto
        maksimal 10 MB per foto.
    */

    const maxSize =
        10 * 1024 * 1024;

    for (const file of files) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            showMessage(
                "albumMessage",
                `File "${file.name}" bukan gambar.`
            );

            return;
        }

        if (
            file.size > maxSize
        ) {

            showMessage(
                "albumMessage",
                `Foto "${file.name}" terlalu besar. Maksimal 10 MB.`
            );

            return;
        }
    }


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Membuat album...";
    }


    showMessage(
        "albumMessage",
        "Menyimpan album...",
        "info"
    );


    let createdAlbum = null;


    try {

        /* =================================================
           STEP 1
           INSERT ALBUM

           TIDAK ADA:
           cover_path
        ================================================= */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title:
                        title,

                    tanggal:
                        tanggal,

                    lokasi:
                        lokasi || null,

                    cerita:
                        cerita || null,

                    cover_url:
                        null
                })
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url"
                )
                .single();


        if (albumError) {

            throw new Error(
                albumError.message
            );
        }


        createdAlbum =
            album;


        /* =================================================
           STEP 2
           UPLOAD PHOTOS
        ================================================= */

        let uploadedPhotos =
            [];


        if (files.length > 0) {

            uploadedPhotos =
                await uploadAlbumPhotos(
                    album.id,
                    files
                );
        }


        /* =================================================
           STEP 3
           SET COVER URL

           HANYA menggunakan cover_url.
           TIDAK menggunakan cover_path.
        ================================================= */

        if (
            uploadedPhotos.length > 0
        ) {

            const firstPhoto =
                uploadedPhotos[0];


            const {
                error:
                    coverError
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            firstPhoto.foto_url
                    })
                    .eq(
                        "id",
                        album.id
                    );


            if (coverError) {

                console.error(
                    "COVER UPDATE ERROR:",
                    coverError
                );
            }
        }


        showMessage(
            "albumMessage",
            "Album berhasil dibuat ❤️",
            "success"
        );


        setTimeout(
            async () => {

                closeAddAlbumModal();

                await loadAlbums();

            },
            700
        );


    } catch (error) {

        console.error(
            "TAMBAH ALBUM ERROR:",
            error
        );


        /*
            Kalau album berhasil dibuat
            tetapi upload foto gagal,
            hapus album agar tidak ada
            album kosong yang tidak sengaja.
        */

        if (createdAlbum) {

            try {

                await supabaseClient
                    .from("albums")
                    .delete()
                    .eq(
                        "id",
                        createdAlbum.id
                    );

            } catch (
                cleanupError
            ) {

                console.error(
                    "CLEANUP ERROR:",
                    cleanupError
                );
            }
        }


        showMessage(
            "albumMessage",
            "Gagal membuat album: " +
            error.message
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Buat Album ❤️";
        }
    }
}


/* =====================================================
   26. UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    const photoRows = [];


    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            continue;
        }


        /*
            Nama file aman.
        */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const baseName =
            file.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "-"
                )
                .substring(
                    0,
                    80
                );


        const fileName =
            `${Date.now()}-${i}-${baseName}.${extension}`;


        /*
            Folder berdasarkan UUID album.

            Contoh:

            UUID/
            foto-1.jpg
            foto-2.jpg
        */

        const filePath =
            `${albumId}/${fileName}`;


        /* =================================================
           UPLOAD STORAGE
        ================================================= */

        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "STORAGE UPLOAD ERROR:",
                uploadError
            );

            throw new Error(
                "Upload foto gagal: " +
                uploadError.message
            );
        }


        /*
            Ambil public URL.

            Kita TIDAK menyimpan
            filePath ke database.
        */

        const {
            data:
                publicUrlData
        } =
            supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .getPublicUrl(
                    uploadData.path
                );


        const publicUrl =
            publicUrlData.publicUrl;


        /*
            HANYA masukkan kolom:

            album_id
            foto_url

            TIDAK:
            foto_path
        */

        photoRows.push({
            album_id:
                albumId,

            foto_url:
                publicUrl
        });
    }


    /* =================================================
       INSERT PHOTO DATABASE
    ================================================= */

    if (
        photoRows.length > 0
    ) {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .insert(
                    photoRows
                );


        if (error) {

            console.error(
                "INSERT PHOTO ERROR:",
                error
            );


            /*
                Foto sudah terupload
                ke Storage tetapi database gagal.

                Kita coba hapus file dari Storage
                dengan mengambil path dari URL.
            */

            for (
                const photo
                of photoRows
            ) {

                const path =
                    extractStoragePath(
                        photo.foto_url
                    );

                if (path) {

                    await supabaseClient
                        .storage
                        .from(
                            STORAGE_BUCKET
                        )
                        .remove([
                            path
                        ]);
                }
            }


            throw new Error(
                "Foto gagal disimpan: " +
                error.message
            );
        }
    }


    return photoRows;
}


/* =====================================================
   27. EXTRACT STORAGE PATH FROM URL
===================================================== */

/*
    Karena database tidak mempunyai
    kolom foto_path, kita mengambil
    path langsung dari foto_url
    ketika perlu menghapus file.

    Contoh URL:

    https://xxxx.supabase.co/storage/v1/object/public/
    ALBUM-PHOTOS/UUID/foto.jpg

    hasil:

    UUID/foto.jpg
*/

function extractStoragePath(
    publicUrl
) {

    if (!publicUrl) {
        return null;
    }

    try {

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;

        const index =
            publicUrl.indexOf(
                marker
            );

        if (index === -1) {
            return null;
        }

        return publicUrl.substring(
            index +
            marker.length
        );

    } catch (error) {

        console.error(
            "EXTRACT STORAGE PATH ERROR:",
            error
        );

        return null;
    }
}


/* =====================================================
   28. ADD PHOTOS TO EXISTING ALBUM
===================================================== */

function triggerAddPhotos() {

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const input =
        document.getElementById(
            "additionalPhotos"
        );

    if (input) {
        input.click();
    }
}


async function addPhotosToCurrentAlbum(
    event
) {

    if (!currentUser) {

        openLoginModal();

        return;
    }


    if (!currentAlbum) {

        alert(
            "Album belum dipilih."
        );

        return;
    }


    const files =
        Array.from(
            event.target.files || []
        );


    if (!files.length) {
        return;
    }


    const maxSize =
        10 * 1024 * 1024;


    for (
        const file
        of files
    ) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                `"${file.name}" bukan gambar.`
            );

            event.target.value = "";

            return;
        }


        if (
            file.size > maxSize
        ) {

            alert(
                `"${file.name}" terlalu besar. Maksimal 10 MB.`
            );

            event.target.value = "";

            return;
        }
    }


    try {

        const newPhotos =
            await uploadAlbumPhotos(
                currentAlbum.id,
                files
            );


        albumPhotosCache =
            [
                ...albumPhotosCache,
                ...newPhotos
            ];


        /*
            Jika album belum mempunyai cover,
            gunakan foto pertama.
        */

        if (
            !currentAlbum.cover_url &&
            newPhotos.length
        ) {

            const newCover =
                newPhotos[0].foto_url;


            const {
                error
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            newCover
                    })
                    .eq(
                        "id",
                        currentAlbum.id
                    );


            if (error) {

                console.error(
                    "UPDATE COVER ERROR:",
                    error
                );

            } else {

                currentAlbum.cover_url =
                    newCover;
            }
        }


        renderAlbumViewer(
            currentAlbum,
            albumPhotosCache
        );


        await loadAlbums();


        alert(
            "Foto berhasil ditambahkan ❤️"
        );


    } catch (error) {

        console.error(
            "ADD PHOTO ERROR:",
            error
        );

        alert(
            "Gagal menambahkan foto:\n" +
            error.message
        );

    } finally {

        event.target.value =
            "";
    }
}


/* =====================================================
   29. DELETE PHOTO
===================================================== */

async function hapusFotoAlbum(
    photoId,
    photoUrl
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus foto ini?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
            Ambil data foto terlebih dahulu
            untuk mendapatkan URL.
        */

        const {
            data: photo,
            error: findError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .select(
                    "id,album_id,foto_url"
                )
                .eq(
                    "id",
                    photoId
                )
                .single();


        if (findError) {

            throw new Error(
                findError.message
            );
        }


        /* =================================================
           HAPUS DATABASE
        ================================================= */

        const {
            error:
                deleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "id",
                    photoId
                );


        if (deleteError) {

            throw new Error(
                deleteError.message
            );
        }


        /* =================================================
           HAPUS STORAGE
           
           Tidak membutuhkan foto_path.
           Path diambil dari foto_url.
        ================================================= */

        const storagePath =
            extractStoragePath(
                photo.foto_url ||
                photoUrl
            );


        if (storagePath) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove([
                        storagePath
                    ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );
            }
        }


        /*
            Kalau foto yang dihapus
            adalah cover album,
            cari foto berikutnya.
        */

        if (
            currentAlbum &&
            currentAlbum.cover_url ===
            (
                photo.foto_url ||
                photoUrl
            )
        ) {

            const remainingPhotos =
                await getAlbumPhotos(
                    currentAlbum.id
                );


            const newCover =
                remainingPhotos.length
                    ?
                    remainingPhotos[0]
                        .foto_url
                    :
                    null;


            await supabaseClient
                .from("albums")
                .update({
                    cover_url:
                        newCover
                })
                .eq(
                    "id",
                    currentAlbum.id
                );


            currentAlbum.cover_url =
                newCover;
        }


        /*
            Buka ulang album
        */

        await openAlbum(
            currentAlbum.id
        );


        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );

        alert(
            "Gagal menghapus foto:\n" +
            error.message
        );
    }
}


/* =====================================================
   30. DELETE ALBUM
===================================================== */

async function hapusAlbum(
    albumId
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus album ini beserta semua fotonya?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        /*
            Ambil semua foto.
        */

        const photos =
            await getAlbumPhotos(
                albumId
            );


        /* =================================================
           HAPUS FILE STORAGE
           
           Path diambil dari foto_url.
        ================================================= */

        const paths =
            photos
                .map(
                    photo =>
                        extractStoragePath(
                            photo.foto_url
                        )
                )
                .filter(Boolean);


        if (paths.length) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
                    );


            if (storageError) {

                console.warn(
                    "STORAGE DELETE WARNING:",
                    storageError
                );
            }
        }


        /* =================================================
           HAPUS PHOTO DATABASE
        ================================================= */

        const {
            error:
                photosDeleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "album_id",
                    albumId
                );


        if (
            photosDeleteError
        ) {

            throw new Error(
                photosDeleteError.message
            );
        }


        /* =================================================
           HAPUS ALBUM
        ================================================= */

        const {
            error:
                albumDeleteError
        } =
            await supabaseClient
                .from("albums")
                .delete()
                .eq(
                    "id",
                    albumId
                );


        if (
            albumDeleteError
        ) {

            throw new Error(
                albumDeleteError.message
            );
        }


        if (
            currentAlbum &&
            String(currentAlbum.id) ===
            String(albumId)
        ) {

            closeAlbumViewer();
        }


        await loadAlbums();


        alert(
            "Album berhasil dihapus ❤️"
        );


    } catch (error) {

        console.error(
            "DELETE ALBUM ERROR:",
            error
        );

        alert(
            "Gagal menghapus album:\n" +
            error.message
        );
    }
}


/* =====================================================
   31. PLAYLIST
===================================================== */

function openPlaylist(event) {

    if (event) {
        event.preventDefault();
    }

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList
        .remove("hidden");
}


function closePlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList
        .add("hidden");
}


/* =====================================================
   32. ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        closeLoginModal();

        closeAddAlbumModal();

        closeAlbumViewer();

        closePlaylist();
    }
);


/* =====================================================
   33. OLD HTML COMPATIBILITY
===================================================== */

function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


/* =====================================================
   34. GLOBAL FUNCTIONS
===================================================== */

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.loginAdmin =
    loginAdmin;

window.logoutAdmin =
    logoutAdmin;

window.openAddAlbumModal =
    openAddAlbumModal;

window.closeAddAlbumModal =
    closeAddAlbumModal;

window.tambahAlbum =
    tambahAlbum;

window.tambahKenangan =
    tambahKenangan;

window.openAlbum =
    openAlbum;

window.closeAlbumViewer =
    closeAlbumViewer;

window.previewPhoto =
    previewPhoto;

window.triggerAddPhotos =
    triggerAddPhotos;

window.addPhotosToCurrentAlbum =
    addPhotosToCurrentAlbum;

window.hapusFotoAlbum =
    hapusFotoAlbum;

window.hapusAlbum =
    hapusAlbum;

window.openPlaylist =
    openPlaylist;

window.closePlaylist =
    closePlaylist;


/* =====================================================
   35. INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            if (
                !SUPABASE_URL ||
                !SUPABASE_KEY
            ) {

                console.error(
                    "Supabase belum dikonfigurasi."
                );

                return;
            }


            await checkLogin();

            await loadAlbums();

        } catch (error) {

            console.error(
                "INITIALIZATION ERROR:",
                error
            );
        }
  /* =====================================================
   UNTUK LILA ❤️
   SCRIPT.JS - FINAL VERSION
   =====================================================

   STRUKTUR DATABASE YANG DIGUNAKAN:

   TABLE albums
   -------------------------
   id
   title
   date
   lokasi
   cerita
   cover_url

   TABLE album_photos
   -------------------------
   id
   album_id
   foto_url
   created_at

   STORAGE BUCKET
   -------------------------
   ALBUM-PHOTOS

   CATATAN:
   - Tidak menggunakan "tanggal"
   - Tidak menggunakan "judul"
   - Tidak menggunakan "foto_path"
   - Tidak menggunakan "cover_path"
===================================================== */


/* =====================================================
   1. SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";

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

let currentAlbum = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =====================================================
   4. HERO TEXT
===================================================== */

const heroTexts = [
    "Setiap hari bersamamu adalah rumah.",
    "Bersamamu, semua terasa cukup.",
    "Kita mungkin sederhana, tapi cerita kita istimewa.",
    "Terima kasih sudah menjadi bagian dari hidupku.",
    "Semoga cerita kita selalu punya halaman baru.",
    "Aku suka semua cerita yang melibatkan kita.",
    "Dari sekian banyak tempat, rumahku tetap kamu.",
    "Kalau ada kamu, semuanya terasa lebih baik."
];

let heroTextIndex = 0;


/* =====================================================
   5. HERO TEXT BERGANTI OTOMATIS
===================================================== */

function changeHeroText() {

    const element =
        document.getElementById("heroTitle");

    if (!element) {
        return;
    }

    element.style.opacity = "0";

    setTimeout(() => {

        heroTextIndex++;

        if (
            heroTextIndex >=
            heroTexts.length
        ) {
            heroTextIndex = 0;
        }

        element.textContent =
            heroTexts[heroTextIndex];

        element.style.opacity = "1";

    }, 450);
}


setInterval(
    changeHeroText,
    5000
);


/* =====================================================
   6. UTILITY - ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   7. FORMAT TANGGAL
===================================================== */

function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }

    /*
        Input database:
        YYYY-MM-DD

        Kita tambahkan T00:00:00
        supaya tidak bergeser satu hari
        karena timezone.
    */

    let date;

    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {

        date =
            new Date(
                dateValue +
                "T00:00:00"
            );

    } else {

        date =
            new Date(dateValue);
    }

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return escapeHTML(
            dateValue
        );
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
   8. FORMAT TANGGAL UNTUK INPUT DATE
===================================================== */

function normalizeDateForInput(
    dateValue
) {

    if (!dateValue) {
        return "";
    }

    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
        return dateValue;
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =====================================================
   9. SHOW MESSAGE
===================================================== */

function showMessage(
    elementId,
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            elementId
        );

    if (!element) {
        return;
    }

    element.textContent =
        message;

    element.className =
        "form-message " +
        type;

    if (!message) {
        element.className =
            "form-message";
    }
}


/* =====================================================
   10. TIME TOGETHER
===================================================== */

function updateTimeTogether() {

    const startDate =
        new Date(
            "2024-04-24T00:00:00"
        );

    const now =
        new Date();

    const difference =
        now.getTime() -
        startDate.getTime();

    if (
        difference < 0
    ) {
        return;
    }

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );

    const daysElement =
        document.getElementById(
            "daysTogether"
        );

    const hoursElement =
        document.getElementById(
            "hoursTogether"
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
            );
    }
}


updateTimeTogether();


setInterval(
    updateTimeTogether,
    60000
);


/* =====================================================
   11. LOGIN MODAL
===================================================== */

function openLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );
}


function closeLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );

    showMessage(
        "loginMessage",
        ""
    );
}


/* =====================================================
   12. LOGIN ADMIN
===================================================== */

async function loginAdmin(
    event
) {

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

    if (
        !emailInput ||
        !passwordInput
    ) {
        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showMessage(
            "loginMessage",
            "Email dan password wajib diisi."
        );

        return;
    }

    showMessage(
        "loginMessage",
        "Sedang masuk...",
        "info"
    );

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });

        if (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            showMessage(
                "loginMessage",
                "Login gagal: " +
                error.message
            );

            return;
        }

        currentUser =
            data.user;

        updateAdminUI();

        closeLoginModal();

        await loadAlbums();

    } catch (error) {

        console.error(
            "LOGIN EXCEPTION:",
            error
        );

        showMessage(
            "loginMessage",
            "Terjadi kesalahan saat login: " +
            error.message
        );
    }
}


/* =====================================================
   13. LOGOUT
===================================================== */

async function logoutAdmin() {

    try {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();

        if (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

            return;
        }

        currentUser =
            null;

        currentAlbum =
            null;

        albumPhotosCache =
            [];

        updateAdminUI();

        closeAlbumViewer();

        await loadAlbums();

    } catch (error) {

        console.error(
            "LOGOUT EXCEPTION:",
            error
        );
    }
}


/* =====================================================
   14. CHECK LOGIN SESSION
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

            console.error(
                "SESSION ERROR:",
                error
            );

            currentUser =
                null;

        } else {

            currentUser =
                data.session?.user ||
                null;
        }

        updateAdminUI();

    } catch (error) {

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
   15. UPDATE ADMIN UI
===================================================== */

function updateAdminUI() {

    const adminButton =
        document.getElementById(
            "adminButton"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const addAlbumButton =
        document.getElementById(
            "addAlbumButton"
        );

    if (currentUser) {

        adminButton
            ?.classList
            .add("hidden");

        logoutButton
            ?.classList
            .remove("hidden");

        addAlbumButton
            ?.classList
            .remove("hidden");

    } else {

        adminButton
            ?.classList
            .remove("hidden");

        logoutButton
            ?.classList
            .add("hidden");

        addAlbumButton
            ?.classList
            .add("hidden");
    }
}


/* =====================================================
   16. SUPABASE AUTH LISTENER
===================================================== */

supabaseClient
    .auth
    .onAuthStateChange(
        (_event, session) => {

            currentUser =
                session?.user ||
                null;

            updateAdminUI();
        }
    );


/* =====================================================
   17. LOAD ALBUMS
===================================================== */

async function loadAlbums() {

    const list =
        document.getElementById(
            "timelineList"
        );

    if (!list) {
        return;
    }

    list.innerHTML =
        `
        <div class="loading">
            Memuat cerita kita...
        </div>
        `;

    try {

        /*
            PENTING:

            Database menggunakan:
            date

            BUKAN:
            tanggal
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("albums")
                .select(
                    "id, title, date, lokasi, cerita, cover_url"
                )
                .order(
                    "date",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "LOAD ALBUM ERROR:",
                error
            );

            list.innerHTML =
                `
                <div class="empty-state">

                    <strong>
                        Gagal memuat album
                    </strong>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>
                `;

            return;
        }

        albumsCache =
            data || [];

        await renderAlbums(
            albumsCache
        );

    } catch (error) {

        console.error(
            "LOAD ALBUM EXCEPTION:",
            error
        );

        list.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Gagal memuat album
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
            `;
    }
}


/* =====================================================
   18. GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    if (!albumId) {
        return [];
    }

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("album_photos")
                .select(
                    "id, album_id, foto_url, created_at"
                )
                .eq(
                    "album_id",
                    albumId
                )
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "LOAD PHOTO ERROR:",
                error
            );

            return [];
        }

        return data || [];

    } catch (error) {

        console.error(
            "GET PHOTO EXCEPTION:",
            error
        );

        return [];
    }
}


/* =====================================================
   19. RENDER ALBUMS
===================================================== */

async function renderAlbums(
    albums
) {

    const list =
        document.getElementById(
            "timelineList"
        );

    if (!list) {
        return;
    }

    if (!albums.length) {

        list.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Belum ada cerita ❤️
                </strong>

                <p>
                    Login sebagai admin
                    untuk membuat album pertama.
                </p>

            </div>
            `;

        return;
    }

    list.innerHTML = "";

    for (
        const album of albums
    ) {

        const photos =
            await getAlbumPhotos(
                album.id
            );

        /*
            Foto pertama digunakan sebagai
            fallback cover.

            Prioritas:
            1. cover_url
            2. foto pertama
        */

        const firstPhoto =
            album.cover_url ||
            (
                photos.length
                    ? photos[0].foto_url
                    : ""
            );

        const item =
            document.createElement(
                "article"
            );

        item.className =
            "timeline-item";

        const title =
            album.title ||
            "Tanpa Judul";

        item.innerHTML =
            `
            <div class="timeline-dot"></div>

            <div class="timeline-card">

                ${
                    firstPhoto
                    ?
                    `
                    <div class="timeline-cover-wrapper">

                        <img
                            class="timeline-cover"
                            src="${escapeHTML(
                                firstPhoto
                            )}"
                            alt="${escapeHTML(
                                title
                            )}"
                            loading="lazy"
                        >

                    </div>
                    `
                    :
                    `
                    <div class="timeline-cover timeline-cover-empty">
                        ❤️
                    </div>
                    `
                }


                <div class="timeline-body">

                    <div class="timeline-date">
                        ${formatTanggal(
                            album.date
                        )}
                    </div>


                    <h3 class="timeline-title">
                        ${escapeHTML(
                            title
                        )}
                    </h3>


                    ${
                        album.lokasi
                        ?
                        `
                        <div class="timeline-location">

                            📍

                            ${escapeHTML(
                                album.lokasi
                            )}

                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        album.cerita
                        ?
                        `
                        <div class="timeline-story">

                            ${escapeHTML(
                                album.cerita
                            )}

                        </div>
                        `
                        :
                        ""
                    }


                    <div class="timeline-actions">

                        <button
                            class="primary-button"
                            onclick="openAlbum('${escapeHTML(
                                album.id
                            )}')"
                        >
                            Buka Album ❤️
                        </button>


                        ${
                            currentUser
                            ?
                            `
                            <button
                                class="secondary-button"
                                onclick="hapusAlbum('${escapeHTML(
                                    album.id
                                )}')"
                            >
                                Hapus Album
                            </button>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            </div>
            `;

        list.appendChild(
            item
        );
    }
}


/* =====================================================
   20. OPEN ALBUM
===================================================== */

async function openAlbum(
    albumId
) {

    const viewer =
        document.getElementById(
            "albumViewer"
        );

    const content =
        document.getElementById(
            "albumViewerContent"
        );

    if (!viewer || !content) {
        return;
    }

    viewer.classList.remove(
        "hidden"
    );

    content.innerHTML =
        `
        <div class="loading">
            Membuka album...
        </div>
        `;

    try {

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .select(
                    "id, title, date, lokasi, cerita, cover_url"
                )
                .eq(
                    "id",
                    albumId
                )
                .single();

        if (albumError) {

            console.error(
                "OPEN ALBUM ERROR:",
                albumError
            );

            content.innerHTML =
                `
                <div class="empty-state">

                    <strong>
                        Gagal membuka album
                    </strong>

                    <p>
                        ${escapeHTML(
                            albumError.message
                        )}
                    </p>

                </div>
                `;

            return;
        }

        const photos =
            await getAlbumPhotos(
                albumId
            );

        currentAlbum =
            album;

        albumPhotosCache =
            photos;

        renderAlbumViewer(
            album,
            photos
        );

    } catch (error) {

        console.error(
            "OPEN ALBUM EXCEPTION:",
            error
        );

        content.innerHTML =
            `
            <div class="empty-state">

                <strong>
                    Gagal membuka album
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>
            `;
    }
}


/* =====================================================
   21. RENDER ALBUM VIEWER
===================================================== */

function renderAlbumViewer(
    album,
    photos
) {

    const content =
        document.getElementById(
            "albumViewerContent"
        );

    if (!content) {
        return;
    }

    const title =
        album.title ||
        "Tanpa Judul";

    content.innerHTML =
        `
        <div class="album-viewer-header">

            <div class="album-viewer-date">

                ${formatTanggal(
                    album.date
                )}

            </div>


            <h2>

                ${escapeHTML(
                    title
                )}

            </h2>


            ${
                album.lokasi
                ?
                `
                <div class="album-viewer-location">

                    📍

                    ${escapeHTML(
                        album.lokasi
                    )}

                </div>
                `
                :
                ""
            }


            ${
                album.cerita
                ?
                `
                <div class="album-viewer-story">

                    ${escapeHTML(
                        album.cerita
                    )}

                </div>
                `
                :
                ""
            }

        </div>


        <div class="album-toolbar">

            <h3>
                Foto Kenangan
            </h3>


            ${
                currentUser
                ?
                `
                <button
                    class="primary-button"
                    onclick="triggerAddPhotos()"
                >
                    + Tambahkan Foto
                </button>

                <input
                    id="additionalPhotos"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onchange="addPhotosToCurrentAlbum(event)"
                >
                `
                :
                ""
            }

        </div>


        <div class="album-photo-grid">

            ${
                photos.length
                ?
                photos
                    .map(
                        photo =>
                        `
                        <div
                            class="album-photo-item"
                        >

                            <img
                                src="${escapeHTML(
                                    photo.foto_url
                                )}"
                                alt="Foto kenangan"
                                onclick="previewPhoto('${escapeHTML(
                                    photo.foto_url
                                )}')"
                                loading="lazy"
                            >


                            ${
                                currentUser
                                ?
                                `
                                <button
                                    class="delete-photo-button"
                                    onclick="hapusFotoAlbum('${escapeHTML(
                                        photo.id
                                    )}', '${escapeHTML(
                                        photo.foto_url
                                    )}')"
                                    title="Hapus foto"
                                >
                                    ×
                                </button>
                                `
                                :
                                ""
                            }

                        </div>
                        `
                    )
                    .join("")
                :
                `
                <div
                    class="empty-state"
                    style="grid-column:1/-1"
                >

                    <strong>
                        Belum ada foto
                    </strong>

                    <p>

                        ${
                            currentUser
                            ?
                            "Klik Tambahkan Foto untuk menambahkan kenangan."
                            :
                            "Album ini belum memiliki foto."
                        }

                    </p>

                </div>
                `
            }

        </div>
        `;
}


/* =====================================================
   22. CLOSE ALBUM VIEWER
===================================================== */

function closeAlbumViewer() {

    const viewer =
        document.getElementById(
            "albumViewer"
        );

    if (viewer) {

        viewer.classList.add(
            "hidden"
        );
    }

    currentAlbum =
        null;

    albumPhotosCache =
        [];
}


/* =====================================================
   23. PREVIEW PHOTO
===================================================== */

function previewPhoto(
    url
) {

    if (!url) {
        return;
    }

    const win =
        window.open(
            "",
            "_blank"
        );

    if (!win) {

        alert(
            "Popup diblokir browser. Izinkan popup untuk melihat foto."
        );

        return;
    }

    win.document.write(
        `
        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>
                Foto Kenangan ❤️
            </title>

            <style>

                * {
                    box-sizing:border-box;
                }

                html,
                body {
                    margin:0;
                    width:100%;
                    height:100%;
                    background:#050507;
                }

                body {
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                }

                img {
                    max-width:100%;
                    max-height:100%;
                    width:auto;
                    height:auto;
                    object-fit:contain;
                    border-radius:16px;
                }

            </style>

        </head>

        <body>

            <img
                src="${escapeHTML(
                    url
                )}"
                alt="Foto Kenangan"
            >

        </body>

        </html>
        `
    );

    win.document.close();
}


/* =====================================================
   24. OPEN ADD ALBUM MODAL
===================================================== */

function openAddAlbumModal() {

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const modal =
        document.getElementById(
            "albumModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );
}


/* =====================================================
   25. CLOSE ADD ALBUM MODAL
===================================================== */

function closeAddAlbumModal() {

    const modal =
        document.getElementById(
            "albumModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }

    const form =
        document.getElementById(
            "albumForm"
        );

    if (form) {
        form.reset();
    }

    const preview =
        document.getElementById(
            "albumPreview"
        );

    if (preview) {
        preview.innerHTML = "";
    }

    showMessage(
        "albumMessage",
        ""
    );

    const button =
        document.getElementById(
            "saveAlbumButton"
        );

    if (button) {

        button.disabled =
            false;

        button.textContent =
            "Buat Album ❤️";
    }
}


/* =====================================================
   26. PHOTO PREVIEW BEFORE UPLOAD
===================================================== */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "albumPhotos"
        ) {
            return;
        }

        const preview =
            document.getElementById(
                "albumPreview"
            );

        if (!preview) {
            return;
        }

        preview.innerHTML =
            "";

        const files =
            Array.from(
                event.target.files || []
            );

        files.forEach(
            file => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {
                    return;
                }

                const reader =
                    new FileReader();

                reader.onload =
                    readerEvent => {

                        const item =
                            document.createElement(
                                "div"
                            );

                        item.className =
                            "photo-preview-item";

                        const image =
                            document.createElement(
                                "img"
                            );

                        image.src =
                            readerEvent.target.result;

                        image.alt =
                            "Preview foto";

                        item.appendChild(
                            image
                        );

                        preview.appendChild(
                            item
                        );
                    };

                reader.readAsDataURL(
                    file
                );
            }
        );
    }
);


/* =====================================================
   27. CREATE ALBUM
===================================================== */

async function tambahAlbum(
    event
) {

    if (event) {
        event.preventDefault();
    }

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const titleInput =
        document.getElementById(
            "albumTitle"
        );

    const dateInput =
        document.getElementById(
            "albumDate"
        );

    const locationInput =
        document.getElementById(
            "albumLocation"
        );

    const storyInput =
        document.getElementById(
            "albumStory"
        );

    const photoInput =
        document.getElementById(
            "albumPhotos"
        );

    if (
        !titleInput ||
        !dateInput
    ) {

        alert(
            "Form album tidak ditemukan."
        );

        return;
    }

    const title =
        titleInput.value.trim();

    const date =
        dateInput.value;

    const lokasi =
        locationInput
            ? locationInput.value.trim()
            : "";

    const cerita =
        storyInput
            ? storyInput.value.trim()
            : "";

    const files =
        Array.from(
            photoInput?.files || []
        );


    /* -------------------------------------------------
       VALIDASI
    ------------------------------------------------- */

    if (!title) {

        showMessage(
            "albumMessage",
            "Nama album wajib diisi."
        );

        titleInput.focus();

        return;
    }

    if (!date) {

        showMessage(
            "albumMessage",
            "Tanggal album wajib diisi."
        );

        dateInput.focus();

        return;
    }


    /* -------------------------------------------------
       BUTTON LOADING
    ------------------------------------------------- */

    const button =
        document.getElementById(
            "saveAlbumButton"
        );

    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Membuat album...";
    }

    showMessage(
        "albumMessage",
        "Menyimpan album...",
        "info"
    );


    try {

        /* =================================================
           STEP 1
           INSERT ALBUM

           DATABASE MENGGUNAKAN:

           title
           date
           lokasi
           cerita
           cover_url

           TIDAK ADA:
           tanggal
           judul
           cover_path
        ================================================= */


        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title: title,

                    date: date,

                    lokasi:
                        lokasi ||
                        null,

                    cerita:
                        cerita ||
                        null,

                    cover_url:
                        null
                })
                .select(
                    "id, title, date, lokasi, cerita, cover_url"
                )
                .single();


        if (albumError) {

            console.error(
                "CREATE ALBUM ERROR:",
                albumError
            );

            throw new Error(
                albumError.message
            );
        }


        if (!album) {

            throw new Error(
                "Album berhasil disimpan tetapi data album tidak ditemukan."
            );
        }


        /* =================================================
           STEP 2
           UPLOAD FOTO
        ================================================= */

        let uploadedPhotos =
            [];

        if (
            files.length > 0
        ) {

            uploadedPhotos =
                await uploadAlbumPhotos(
                    album.id,
                    files
                );
        }


        /* =================================================
           STEP 3
           UPDATE COVER
           
           HANYA:
           cover_url

           TIDAK:
           cover_path
        ================================================= */

        if (
            uploadedPhotos.length > 0
        ) {

            const firstPhoto =
                uploadedPhotos[0];

            const {
                error: coverError
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            firstPhoto.foto_url
                    })
                    .eq(
                        "id",
                        album.id
                    );

            if (coverError) {

                console.error(
                    "COVER UPDATE ERROR:",
                    coverError
                );

                /*
                    Album dan foto sudah berhasil dibuat.
                    Cover gagal diperbarui, tetapi album
                    tetap dapat digunakan.
                */
            }
        }


        /* =================================================
           SUCCESS
        ================================================= */

        showMessage(
            "albumMessage",
            "Album berhasil dibuat ❤️",
            "success"
        );


        if (button) {

            button.textContent =
                "Berhasil ❤️";
        }


        setTimeout(
            async () => {

                closeAddAlbumModal();

                await loadAlbums();

            },
            700
        );


    } catch (error) {

        console.error(
            "TAMBAH ALBUM ERROR:",
            error
        );

        showMessage(
            "albumMessage",
            "Gagal membuat album: " +
            error.message
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Buat Album ❤️";
        }

        return;
    }
}


/* =====================================================
   28. UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    const photoRows =
        [];

    const uploadedStoragePaths =
        [];


    for (
        let i = 0;
        i < files.length;
        i++
    ) {

        const file =
            files[i];

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            continue;
        }


        /* -------------------------------------------------
           BUAT NAMA FILE AMAN
        ------------------------------------------------- */

        const originalName =
            file.name ||
            `foto-${i}`;

        const safeName =
            originalName
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "-"
                );

        const filePath =
            String(albumId) +
            "/" +
            Date.now() +
            "-" +
            i +
            "-" +
            safeName;


        /* -------------------------------------------------
           UPLOAD STORAGE
        ------------------------------------------------- */

        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "UPLOAD ERROR:",
                uploadError
            );

            /*
                Bersihkan file yang sudah
                berhasil di-upload sebelumnya.
            */

            if (
                uploadedStoragePaths.length
            ) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        uploadedStoragePaths
                    );
            }

            throw new Error(
                "Upload foto gagal: " +
                uploadError.message
            );
        }


        const actualPath =
            uploadData?.path ||
            filePath;

        uploadedStoragePaths.push(
            actualPath
        );


        /* -------------------------------------------------
           GET PUBLIC URL
        ------------------------------------------------- */

        const {
            data:
                publicUrlData
        } =
            supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .getPublicUrl(
                    actualPath
                );


        const publicUrl =
            publicUrlData?.publicUrl;


        if (!publicUrl) {

            throw new Error(
                "Public URL foto tidak berhasil dibuat."
            );
        }


        /* -------------------------------------------------
           INSERT DATABASE

           HANYA:

           album_id
           foto_url

           TIDAK ADA:

           foto_path
        ------------------------------------------------- */

        photoRows.push({
            album_id:
                albumId,

            foto_url:
                publicUrl
        });
    }


    /* =====================================================
       INSERT FOTO KE DATABASE
    ===================================================== */

    if (
        photoRows.length > 0
    ) {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .insert(
                    photoRows
                );


        if (error) {

            console.error(
                "INSERT PHOTO ERROR:",
                error
            );


            /*
                Database gagal.
                Hapus file dari Storage.
            */

            if (
                uploadedStoragePaths.length
            ) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        uploadedStoragePaths
                    );
            }


            throw new Error(
                "Foto gagal disimpan: " +
                error.message
            );
        }
    }


    return photoRows;
}


/* =====================================================
   29. TRIGGER ADD PHOTOS
===================================================== */

function triggerAddPhotos() {

    if (!currentUser) {

        openLoginModal();

        return;
    }

    const input =
        document.getElementById(
            "additionalPhotos"
        );

    if (input) {
        input.click();
    }
}


/* =====================================================
   30. GET STORAGE PATH DARI PUBLIC URL
=====================================================

   Karena database TIDAK mempunyai:

   foto_path

   kita ambil path Storage langsung
   dari URL foto ketika ingin menghapus.

===================================================== */

function getStoragePathFromPublicUrl(
    publicUrl
) {

    if (!publicUrl) {
        return null;
    }

    try {

        const url =
            new URL(
                publicUrl
            );

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;

        const index =
            url.pathname.indexOf(
                marker
            );

        if (index === -1) {
            return null;
        }

        const path =
            url.pathname.substring(
                index +
                marker.length
            );

        if (!path) {
            return null;
        }

        return decodeURIComponent(
            path
        );

    } catch (error) {

        console.warn(
            "Tidak dapat membaca storage path:",
            error
        );

        return null;
    }
}


/* =====================================================
   31. ADD PHOTOS TO CURRENT ALBUM
===================================================== */

async function addPhotosToCurrentAlbum(
    event
) {

    if (!currentUser) {

        openLoginModal();

        return;
    }

    if (!currentAlbum) {

        alert(
            "Album belum dipilih."
        );

        return;
    }

    const files =
        Array.from(
            event.target.files || []
        );

    if (!files.length) {
        return;
    }


    try {

        const newPhotos =
            await uploadAlbumPhotos(
                currentAlbum.id,
                files
            );


        albumPhotosCache =
            [
                ...albumPhotosCache,
                ...newPhotos
            ];


        /* -------------------------------------------------
           UPDATE COVER JIKA BELUM ADA
        ------------------------------------------------- */

        if (
            !currentAlbum.cover_url &&
            newPhotos.length > 0
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            newPhotos[0].foto_url
                    })
                    .eq(
                        "id",
                        currentAlbum.id
                    );


            if (error) {

                console.error(
                    "UPDATE COVER ERROR:",
                    error
                );

            } else {

                currentAlbum.cover_url =
                    newPhotos[0].foto_url;
            }
        }


        renderAlbumViewer(
            currentAlbum,
            albumPhotosCache
        );


        await loadAlbums();


        alert(
            "Foto berhasil ditambahkan ❤️"
        );


    } catch (error) {

        console.error(
            "ADD PHOTO ERROR:",
            error
        );

        alert(
            "Gagal menambahkan foto:\n" +
            error.message
        );

    } finally {

        if (event.target) {
            event.target.value =
                "";
        }
    }
}


/* =====================================================
   32. DELETE PHOTO
===================================================== */

async function hapusFotoAlbum(
    photoId,
    photoUrl
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus foto ini?"
        );

    if (!confirmDelete) {
        return;
    }


    try {

        /* -------------------------------------------------
           AMBIL STORAGE PATH DARI URL
        ------------------------------------------------- */

        const storagePath =
            getStoragePathFromPublicUrl(
                photoUrl
            );


        /* -------------------------------------------------
           DELETE DATABASE
        ------------------------------------------------- */

        const {
            error:
                deleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "id",
                    photoId
                );


        if (deleteError) {

            throw new Error(
                deleteError.message
            );
        }


        /* -------------------------------------------------
           DELETE STORAGE
        ------------------------------------------------- */

        if (storagePath) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove([
                        storagePath
                    ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );
            }
        }


        /* -------------------------------------------------
           JIKA FOTO YANG DIHAPUS ADALAH COVER
        ------------------------------------------------- */

        if (
            currentAlbum &&
            currentAlbum.cover_url ===
            photoUrl
        ) {

            const remainingPhotos =
                await getAlbumPhotos(
                    currentAlbum.id
                );

            const newCover =
                remainingPhotos.length > 0
                    ? remainingPhotos[0].foto_url
                    : null;


            const {
                error:
                    coverError
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            newCover
                    })
                    .eq(
                        "id",
                        currentAlbum.id
                    );


            if (coverError) {

                console.warn(
                    "Cover update warning:",
                    coverError
                );

            } else {

                currentAlbum.cover_url =
                    newCover;
            }
        }


        /* -------------------------------------------------
           RELOAD
        ------------------------------------------------- */

        if (currentAlbum) {

            await openAlbum(
                currentAlbum.id
            );
        }

        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );

        alert(
            "Gagal menghapus foto:\n" +
            error.message
        );
    }
}


/* =====================================================
   33. DELETE ALBUM
===================================================== */

async function hapusAlbum(
    albumId
) {

    if (!currentUser) {
        return;
    }


    const confirmDelete =
        confirm(
            "Hapus album ini beserta semua fotonya?"
        );

    if (!confirmDelete) {
        return;
    }


    try {

        /* -------------------------------------------------
           AMBIL SEMUA FOTO
        ------------------------------------------------- */

        const photos =
            await getAlbumPhotos(
                albumId
            );


        /* -------------------------------------------------
           AMBIL STORAGE PATH DARI URL
        ------------------------------------------------- */

        const paths =
            photos
                .map(
                    photo =>
                        getStoragePathFromPublicUrl(
                            photo.foto_url
                        )
                )
                .filter(Boolean);


        /* -------------------------------------------------
           DELETE STORAGE
        ------------------------------------------------- */

        if (
            paths.length > 0
        ) {

            const {
                error:
                    storageError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
                    );


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );
            }
        }


        /* -------------------------------------------------
           DELETE FOTO DATABASE
        ------------------------------------------------- */

        const {
            error:
                photosDeleteError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .delete()
                .eq(
                    "album_id",
                    albumId
                );


        if (
            photosDeleteError
        ) {

            throw new Error(
                photosDeleteError.message
            );
        }


        /* -------------------------------------------------
           DELETE ALBUM DATABASE
        ------------------------------------------------- */

        const {
            error:
                albumDeleteError
        } =
            await supabaseClient
                .from(
                    "albums"
                )
                .delete()
                .eq(
                    "id",
                    albumId
                );


        if (
            albumDeleteError
        ) {

            throw new Error(
                albumDeleteError.message
            );
        }


        /* -------------------------------------------------
           CLOSE VIEWER JIKA ALBUM SEDANG TERBUKA
        ------------------------------------------------- */

        if (
            currentAlbum &&
            currentAlbum.id ===
            albumId
        ) {

            closeAlbumViewer();
        }


        await loadAlbums();


        alert(
            "Album berhasil dihapus ❤️"
        );


    } catch (error) {

        console.error(
            "DELETE ALBUM ERROR:",
            error
        );

        alert(
            "Gagal menghapus album:\n" +
            error.message
        );
    }
}


/* =====================================================
   34. PLAYLIST
===================================================== */

function openPlaylist(
    event
) {

    if (event) {
        event.preventDefault();
    }

    const modal =
        document.getElementById(
            "playlistModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );
}


function closePlaylist() {

    const modal =
        document.getElementById(
            "playlistModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );
}


/* =====================================================
   35. CLOSE MODAL DENGAN ESCAPE
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }

        closeLoginModal();

        closeAddAlbumModal();

        closeAlbumViewer();

        closePlaylist();
    }
);


/* =====================================================
   36. CLOSE MODAL DENGAN BACKDROP
===================================================== */

document.addEventListener(
    "click",
    event => {

        /*
            Tidak diperlukan jika HTML
            sudah menggunakan onclick.
            
            Bagian ini hanya memastikan
            modal tetap mudah digunakan.
        */

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {
            return;
        }
    }
);


/* =====================================================
   37. COMPATIBILITY WITH OLD HTML
===================================================== */

function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


/* =====================================================
   38. GLOBAL FUNCTIONS
===================================================== */

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.loginAdmin =
    loginAdmin;

window.logoutAdmin =
    logoutAdmin;

window.openAddAlbumModal =
    openAddAlbumModal;

window.closeAddAlbumModal =
    closeAddAlbumModal;

window.tambahAlbum =
    tambahAlbum;

window.tambahKenangan =
    tambahKenangan;

window.openAlbum =
    openAlbum;

window.closeAlbumViewer =
    closeAlbumViewer;

window.previewPhoto =
    previewPhoto;

window.triggerAddPhotos =
    triggerAddPhotos;

window.addPhotosToCurrentAlbum =
    addPhotosToCurrentAlbum;

window.hapusFotoAlbum =
    hapusFotoAlbum;

window.hapusAlbum =
    hapusAlbum;

window.openPlaylist =
    openPlaylist;

window.closePlaylist =
    closePlaylist;


/* =====================================================
   39. INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /* -------------------------------------------------
               CEK SUPABASE CONFIG
            ------------------------------------------------- */

            if (
                !SUPABASE_URL ||
                !SUPABASE_KEY ||
                SUPABASE_URL.includes(
                    "MASUKKAN_"
                ) ||
                SUPABASE_KEY.includes(
                    "MASUKKAN_"
                )
            ) {

                console.warn(
                    "Supabase belum dikonfigurasi."
                );

                const list =
                    document.getElementById(
                        "timelineList"
                    );

                if (list) {

                    list.innerHTML =
                        `
                        <div class="empty-state">

                            <strong>
                                Supabase belum dikonfigurasi
                            </strong>

                            <p>
                                Periksa SUPABASE_URL
                                dan SUPABASE_KEY
                                pada script.js.
                            </p>

                        </div>
                        `;
                }

                return;
            }


            /* -------------------------------------------------
               CHECK LOGIN
            ------------------------------------------------- */

            await checkLogin();


            /* -------------------------------------------------
               LOAD ALBUM
            ------------------------------------------------- */

            await loadAlbums();


        } catch (error) {

            console.error(
                "INITIALIZATION ERROR:",
                error
            );

            const list =
                document.getElementById(
                    "timelineList"
                );

            if (list) {

                list.innerHTML =
                    `
                    <div class="empty-state">

                        <strong>
                            Gagal memuat website
                        </strong>

                        <p>
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>
                    `;
            }
        }
    }
);


/* =====================================================
   END OF SCRIPT.JS
===================================================== */  }
);