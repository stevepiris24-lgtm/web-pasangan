/* =====================================================
   UNTUK LILA ❤️
   SCRIPT.JS - FINAL VERSION
   SUPABASE + ALBUM + FOTO
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
   5. HERO TEXT ROTATION
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
   7. FORMAT DATE
===================================================== */

function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }

    /*
        Untuk menghindari masalah timezone,
        kita buat tanggal secara manual.
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

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return escapeHTML(dateValue);
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
   8. FORM MESSAGE
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
   9. TIME TOGETHER
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
   10. LOGIN MODAL
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
   11. LOGIN ADMIN
===================================================== */

async function loginAdmin(event) {

    if (event) {
        event.preventDefault();
    }

    const emailElement =
        document.getElementById(
            "loginEmail"
        );

    const passwordElement =
        document.getElementById(
            "loginPassword"
        );

    if (
        !emailElement ||
        !passwordElement
    ) {
        return;
    }

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value;

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
            await supabaseClient.auth
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
            data.user || null;

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
   12. LOGOUT
===================================================== */

async function logoutAdmin() {

    try {

        await supabaseClient
            .auth
            .signOut();

    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );
    }

    currentUser = null;

    updateAdminUI();

    closeAlbumViewer();

    await loadAlbums();
}


/* =====================================================
   13. CHECK SESSION
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
   14. UPDATE ADMIN UI
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
   15. AUTH STATE LISTENER
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
   16. GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    if (!albumId) {
        return [];
    }

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
            "GET ALBUM PHOTOS ERROR:",
            error
        );

        return [];
    }

    return data || [];
}


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
            <div class="loading-heart">❤️</div>
            <span>Memuat cerita kita...</span>
        </div>
        `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("albums")
                .select(
                    "id, title, tanggal, lokasi, cerita, cover_url"
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

        list.innerHTML =
            `
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
   18. RENDER ALBUMS
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
        Ambil semua foto secara bersamaan
        supaya timeline lebih cepat.
    */

    const photoResults =
        await Promise.all(
            albums.map(
                album =>
                    getAlbumPhotos(
                        album.id
                    )
            )
        );

    albums.forEach(
        (
            album,
            index
        ) => {

            const photos =
                photoResults[index] || [];

            /*
                PRIORITAS COVER:

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
                        <div class="timeline-cover-wrap">

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
                                    this.parentElement.classList.add('cover-error');
                                "
                            >

                            <div class="cover-error-placeholder">
                                ❤️
                            </div>

                        </div>
                        `
                        :
                        `
                        <div class="timeline-cover-wrap no-photo">

                            <div class="timeline-cover-placeholder">
                                ❤️
                            </div>

                        </div>
                        `
                    }

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
                                <span>📍</span>
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

                        <div class="timeline-photo-count">

                            <span>📷</span>

                            ${
                                photos.length
                            }

                            ${
                                photos.length === 1
                                    ? "foto"
                                    : "foto"
                            }

                        </div>

                        <div class="timeline-actions">

                            <button
                                type="button"
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
                                    type="button"
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

            list.appendChild(item);
        }
    );
}


/* =====================================================
   19. OPEN ALBUM
===================================================== */

async function openAlbum(
    albumId
) {

    if (!albumId) {
        return;
    }

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

    document.body.classList.add(
        "modal-open"
    );

    content.innerHTML =
        `
        <div class="loading album-loading">

            <div class="loading-heart">
                ❤️
            </div>

            <span>
                Membuka album...
            </span>

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
                    "id, title, tanggal, lokasi, cerita, cover_url"
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

        content.innerHTML =
            `
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
   20. RENDER ALBUM VIEWER
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

    content.innerHTML =
        `
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

            <div class="album-viewer-info">

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

        </div>

        <div class="album-toolbar">

            <div>

                <h3>
                    Foto Kenangan
                </h3>

                <span>
                    ${photos.length}
                    ${
                        photos.length === 1
                            ? "foto"
                            : "foto"
                    }
                </span>

            </div>

            ${
                currentUser
                ?
                `
                <button
                    type="button"
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
                photos.map(
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
                            onerror="
                                this.parentElement.classList.add('image-error');
                            "
                        >

                        ${
                            currentUser
                            ?
                            `
                            <button
                                type="button"
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
                ).join("")
                :
                `
                <div
                    class="empty-state album-empty"
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
   21. CLOSE ALBUM VIEWER
===================================================== */

function closeAlbumViewer() {

    document
        .getElementById(
            "albumViewer"
        )
        ?.classList
        .add("hidden");

    document.body.classList.remove(
        "modal-open"
    );

    currentAlbum =
        null;

    albumPhotosCache =
        [];
}


/* =====================================================
   22. PREVIEW PHOTO
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

    const safeUrl =
        escapeHTML(url);

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
                    max-width:95vw;
                    max-height:95vh;
                    width:auto;
                    height:auto;
                    object-fit:contain;
                    border-radius:18px;
                    box-shadow:0 20px 60px rgba(0,0,0,.6);
                }

            </style>

        </head>

        <body>

            <img
                src="${safeUrl}"
                alt="Foto Kenangan"
            >

        </body>

        </html>
        `
    );

    win.document.close();
}


/* =====================================================
   23. OPEN ADD ALBUM MODAL
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

    document.body.classList.add(
        "modal-open"
    );

    setTimeout(() => {

        document
            .getElementById(
                "albumTitle"
            )
            ?.focus();

    }, 100);
}


/* =====================================================
   24. CLOSE ADD ALBUM MODAL
===================================================== */

function closeAddAlbumModal() {

    document
        .getElementById(
            "albumModal"
        )
        ?.classList
        .add("hidden");

    document.body.classList.remove(
        "modal-open"
    );

    document
        .getElementById(
            "albumForm"
        )
        ?.reset();

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
}


/* =====================================================
   25. PHOTO PREVIEW BEFORE UPLOAD
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

                        item.innerHTML =
                            `
                            <img
                                src="${readerEvent.target.result}"
                                alt="Preview"
                            >
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
   26. CREATE ALBUM
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

    const titleElement =
        document.getElementById(
            "albumTitle"
        );

    const dateElement =
        document.getElementById(
            "albumDate"
        );

    const locationElement =
        document.getElementById(
            "albumLocation"
        );

    const storyElement =
        document.getElementById(
            "albumStory"
        );

    const photoInput =
        document.getElementById(
            "albumPhotos"
        );

    const title =
        titleElement
            ?.value
            .trim() || "";

    const tanggal =
        dateElement
            ?.value || "";

    const lokasi =
        locationElement
            ?.value
            .trim() || "";

    const cerita =
        storyElement
            ?.value
            .trim() || "";

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
        HTML date input otomatis memberikan:

        YYYY-MM-DD

        Contoh:

        2024-04-24
    */

    const button =
        document.getElementById(
            "saveAlbumButton"
        );

    if (button) {

        button.disabled = true;

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
           CREATE ALBUM
        ================================================= */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title: title,
                    tanggal: tanggal,
                    lokasi:
                        lokasi || null,
                    cerita:
                        cerita || null,
                    cover_url:
                        null
                })
                .select(
                    "id, title, tanggal, lokasi, cerita, cover_url"
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

        createdAlbum =
            album;

        /* =================================================
           STEP 2
           UPLOAD FOTO
        ================================================= */

        let uploadedPhotos = [];

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

                /*
                    Jangan batalkan album hanya
                    karena cover_url gagal.

                    Timeline tetap bisa menggunakan
                    foto pertama dari album_photos.
                */

                console.warn(
                    "COVER UPDATE WARNING:",
                    coverError
                );

            } else {

                createdAlbum.cover_url =
                    firstPhoto.foto_url;
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

        /*
            Tunggu sebentar supaya pesan
            berhasil terlihat.
        */

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
   27. UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    const photoRows = [];

    /*
        Menyimpan path Storage hanya
        sementara di JavaScript.

        Path TIDAK disimpan ke database.

        Ini sesuai struktur database baru.
    */

    const uploadedStoragePaths = [];

    try {

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
                Batasi ukuran file.
                10 MB per foto.
            */

            const maxSize =
                10 * 1024 * 1024;

            if (
                file.size > maxSize
            ) {

                throw new Error(
                    `Foto "${file.name}" terlalu besar. Maksimal 10 MB.`
                );
            }

            /*
                Extension
            */

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();

            /*
                Nama file aman
            */

            const safeName =
                file.name
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        "-"
                    )
                    .replace(
                        /-+/g,
                        "-"
                    );

            /*
                Nama unik
            */

            const uniqueId =
                typeof crypto !== "undefined" &&
                crypto.randomUUID
                    ? crypto.randomUUID()
                    : (
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .substring(2)
                    );

            const fileName =
                uniqueId +
                "-" +
                i +
                "-" +
                safeName;

            /*
                Path Storage:

                UUID album /
                nama-file
            */

            const filePath =
                String(albumId) +
                "/" +
                fileName;

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

            const uploadedPath =
                uploadData?.path ||
                filePath;

            uploadedStoragePaths.push(
                uploadedPath
            );

            /* =================================================
               GET PUBLIC URL
            ================================================= */

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
                        uploadedPath
                    );

            const publicUrl =
                publicUrlData?.publicUrl;

            if (!publicUrl) {

                throw new Error(
                    "URL foto tidak berhasil dibuat."
                );
            }

            /*
                =================================================
                PENTING

                HANYA kolom berikut yang dikirim:

                album_id
                foto_url

                TIDAK ADA:

                foto_path
                =================================================
            */

            photoRows.push({
                album_id:
                    albumId,

                foto_url:
                    publicUrl
            });
        }

        /* =================================================
           INSERT FOTO KE DATABASE
        ================================================= */

        if (
            photoRows.length > 0
        ) {

            const {
                error:
                    photoInsertError
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .insert(
                        photoRows
                    );

            if (
                photoInsertError
            ) {

                console.error(
                    "PHOTO DATABASE ERROR:",
                    photoInsertError
                );

                throw new Error(
                    "Foto gagal disimpan: " +
                    photoInsertError.message
                );
            }
        }

        return photoRows;

    } catch (error) {

        /*
            Jika database gagal setelah
            file berhasil masuk Storage,
            hapus file Storage yang tadi
            berhasil diupload.
        */

        if (
            uploadedStoragePaths.length
        ) {

            try {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        uploadedStoragePaths
                    );

            } catch (
                cleanupError
            ) {

                console.warn(
                    "CLEANUP STORAGE ERROR:",
                    cleanupError
                );
            }
        }

        throw error;
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

    try {

        const newPhotos =
            await uploadAlbumPhotos(
                currentAlbum.id,
                files
            );

        /*
            Tambahkan foto ke cache.
        */

        albumPhotosCache =
            [
                ...albumPhotosCache,
                ...newPhotos
            ];

        /*
            Jika album belum memiliki cover,
            gunakan foto pertama.
        */

        if (
            !currentAlbum.cover_url &&
            newPhotos.length > 0
        ) {

            const firstPhoto =
                newPhotos[0];

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
                        currentAlbum.id
                    );

            if (!coverError) {

                currentAlbum.cover_url =
                    firstPhoto.foto_url;
            }
        }

        /*
            Reload album viewer.
        */

        await openAlbum(
            currentAlbum.id
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

        if (event?.target) {
            event.target.value = "";
        }
    }
}


/* =====================================================
   29. GET STORAGE PATH FROM PUBLIC URL
===================================================== */

function getStoragePathFromPublicUrl(
    url
) {

    if (!url) {
        return null;
    }

    try {

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;

        const index =
            url.indexOf(
                marker
            );

        if (index === -1) {
            return null;
        }

        return decodeURIComponent(
            url.substring(
                index + marker.length
            )
        );

    } catch (error) {

        console.warn(
            "GET STORAGE PATH ERROR:",
            error
        );

        return null;
    }
}


/* =====================================================
   30. DELETE PHOTO
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
            Ambil URL foto dari database
            sebelum dihapus.
        */

        let urlToDelete =
            photoUrl || "";

        if (!urlToDelete) {

            const {
                data:
                    photoData
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .select(
                        "foto_url"
                    )
                    .eq(
                        "id",
                        photoId
                    )
                    .single();

            urlToDelete =
                photoData?.foto_url ||
                "";
        }

        /*
            Hapus database
        */

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

        /*
            Hapus Storage.

            Path diambil dari URL,
            bukan dari kolom database.
        */

        const storagePath =
            getStoragePathFromPublicUrl(
                urlToDelete
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
                    "STORAGE DELETE WARNING:",
                    storageError
                );
            }
        }

        /*
            Ambil foto yang tersisa.
        */

        const remainingPhotos =
            await getAlbumPhotos(
                currentAlbum.id
            );

        /*
            Kalau foto yang dihapus
            adalah cover, gunakan foto
            berikutnya sebagai cover.
        */

        let newCoverUrl =
            null;

        if (
            remainingPhotos.length > 0
        ) {

            newCoverUrl =
                remainingPhotos[0]
                    .foto_url;
        }

        await supabaseClient
            .from("albums")
            .update({
                cover_url:
                    newCoverUrl
            })
            .eq(
                "id",
                currentAlbum.id
            );

        currentAlbum.cover_url =
            newCoverUrl;

        /*
            Reload viewer.
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
   31. DELETE ALBUM
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

        /*
            Ambil Storage path dari
            masing-masing URL.
        */

        const paths =
            photos
                .map(
                    photo =>
                        getStoragePathFromPublicUrl(
                            photo.foto_url
                        )
                )
                .filter(Boolean);

        /*
            Hapus Storage.
        */

        if (paths.length > 0) {

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

        /*
            Hapus foto database.
        */

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

        /*
            Hapus album.
        */

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

        /*
            Tutup viewer kalau
            album sedang dibuka.
        */

        if (
            currentAlbum &&
            String(currentAlbum.id) ===
            String(albumId)
        ) {

            closeAlbumViewer();
        }

        await loadAlbums();

        alert(
            "Album berhasil dihapus."
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
   32. PLAYLIST
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

    document.body.classList.add(
        "modal-open"
    );
}


function closePlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        ?.classList
        .add("hidden");

    document.body.classList.remove(
        "modal-open"
    );
}


/* =====================================================
   33. CLOSE MODALS WITH ESC
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
   34. PREVENT MODAL BODY SCROLL
===================================================== */

document.addEventListener(
    "click",
    event => {

        const modal =
            event.target.closest(
                ".modal-box"
            );

        if (modal) {
            event.stopPropagation();
        }
    }
);


/* =====================================================
   35. OLD HTML COMPATIBILITY
===================================================== */

function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


/* =====================================================
   36. GLOBAL FUNCTIONS
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
   37. INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        updateAdminUI();

        updateTimeTogether();

        /*
            Cek konfigurasi.
        */

        if (
            !SUPABASE_URL ||
            !SUPABASE_KEY
        ) {

            console.error(
                "Supabase belum dikonfigurasi."
            );

            const list =
                document.getElementById(
                    "timelineList"
                );

            if (list) {

                list.innerHTML =
                    `
                    <div class="empty-state error-state">

                        <strong>
                            Supabase belum dikonfigurasi
                        </strong>

                        <p>
                            Periksa SUPABASE_URL
                            dan SUPABASE_KEY
                            di script.js.
                        </p>

                    </div>
                    `;
            }

            return;
        }

        /*
            Cek login.
        */

        await checkLogin();

        /*
            Load album.
        */

        await loadAlbums();

    }
);