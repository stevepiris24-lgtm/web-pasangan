/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

/*
    SUPABASE DASHBOARD
    → Project Settings
    → API

    URL:
    Project URL

    KEY:
    Publishable key / anon key
*/

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


/*
    Nama Storage Bucket harus sama persis
    dengan yang ada di Supabase Storage.
*/

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =====================================================
   SUPABASE CLIENT
===================================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   GLOBAL STATE
===================================================== */

let currentUser = null;

let currentAlbum = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =====================================================
   HERO TEXT
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
   CHANGE HERO TEXT
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
   UTILITY - ESCAPE HTML
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
   FORMAT TANGGAL
===================================================== */

function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }

    /*
        PostgreSQL DATE:
        YYYY-MM-DD

        Kita buat tanggal secara lokal
        agar tidak bergeser karena timezone.
    */

    const parts =
        String(dateValue).split("-");

    if (parts.length === 3) {

        const year =
            Number(parts[0]);

        const month =
            Number(parts[1]);

        const day =
            Number(parts[2]);

        if (
            !Number.isNaN(year) &&
            !Number.isNaN(month) &&
            !Number.isNaN(day)
        ) {

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
    }


    /*
        Fallback apabila format
        bukan YYYY-MM-DD.
    */

    const date =
        new Date(dateValue);

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
   SHOW MESSAGE
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
   TIME TOGETHER
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
   LOGIN MODAL
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
   LOGIN ADMIN
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
        emailElement
            .value
            .trim();


    const password =
        passwordElement
            .value;


    if (!email || !password) {

        showMessage(
            "loginMessage",
            "Email dan password wajib diisi."
        );

        return;
    }


    const button =
        document.getElementById(
            "loginSubmitButton"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Masuk...";
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

            throw new Error(
                error.message
            );
        }


        currentUser =
            data.user ||
            null;


        updateAdminUI();


        /*
            Bersihkan password.
        */

        passwordElement.value =
            "";


        closeLoginModal();


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


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Masuk ❤️";
        }
    }
}


/* =====================================================
   LOGOUT
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
   CHECK SESSION
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
   UPDATE ADMIN UI
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
   AUTH STATE LISTENER
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
   LOAD ALBUMS
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
            =================================================
            PERBAIKAN UTAMA

            DATABASE:

            albums.date

            BUKAN:

            albums.tanggal
            =================================================
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("albums")
                .select("*")
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
            "LOAD ALBUMS ERROR:",
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
   GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    if (!albumId) {
        return [];
    }


    try {

        /*
            ID dikirim langsung sebagai UUID/string.

            JANGAN gunakan:

            Number(albumId)
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("album_photos")
                .select("*")
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
   RENDER ALBUMS
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


    /*
        Render satu per satu supaya
        cover foto dapat diambil.
    */

    for (
        const album of albums
    ) {

        const photos =
            await getAlbumPhotos(
                album.id
            );


        /*
            Sesuai struktur album_photos
            yang digunakan project kakak:

            foto_url
        */

        const firstPhoto =
            photos.length > 0
                ? (
                    photos[0].foto_url ||
                    ""
                )
                : (
                    album.cover_url ||
                    ""
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
                    `
                    :
                    `
                    <div
                        class="timeline-cover"
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:70px;
                        "
                    >
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
                        album.location
                        ?
                        `
                        <div class="timeline-location">

                            📍

                            ${escapeHTML(
                                album.location
                            )}

                        </div>
                        `
                        :
                        ""
                    }


                    ${
                        album.story
                        ?
                        `
                        <div class="timeline-story">

                            ${escapeHTML(
                                album.story
                            )}

                        </div>
                        `
                        :
                        ""
                    }


                    <div class="timeline-actions">


                        <button
                            class="primary-button"
                            type="button"
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
                                type="button"
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
   OPEN ALBUM
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
                .select("*")
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


        if (!album) {

            throw new Error(
                "Album tidak ditemukan."
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
   RENDER ALBUM VIEWER
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
                album.location
                ?
                `
                <div class="album-viewer-location">

                    📍

                    ${escapeHTML(
                        album.location
                    )}

                </div>
                `
                :
                ""
            }


            ${
                album.story
                ?
                `
                <div class="album-viewer-story">

                    ${escapeHTML(
                        album.story
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
                    type="button"
                    onclick="triggerAddPhotos()"
                >
                    + Tambahkan Foto
                </button>


                <input
                    id="additionalPhotos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
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
                photos.length > 0
                ?
                photos.map(
                    photo => {

                        const photoUrl =
                            photo.foto_url ||
                            "";


                        return `
                        <div
                            class="album-photo-item"
                        >

                            <img
                                src="${escapeHTML(
                                    photoUrl
                                )}"
                                alt="Foto kenangan"
                                onclick="previewPhoto('${escapeHTML(
                                    photoUrl
                                )}')"
                                loading="lazy"
                            >


                            ${
                                currentUser
                                ?
                                `
                                <button
                                    class="delete-photo-button"
                                    type="button"
                                    onclick="hapusFotoAlbum(
                                        '${escapeHTML(
                                            photo.id
                                        )}',
                                        '${escapeHTML(
                                            photo.foto_path || ""
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
                ).join("")
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
   CLOSE ALBUM VIEWER
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
   PREVIEW PHOTO
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

        <html>

        <head>

            <meta
                charset="UTF-8"
            >

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

                    object-fit:contain;

                    border-radius:16px;

                }

            </style>

        </head>


        <body>

            <img
                src="${escapeHTML(url)}"
                alt="Foto kenangan"
            >

        </body>

        </html>
        `
    );


    win.document.close();
}


/* =====================================================
   ADD ALBUM MODAL
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


    setTimeout(() => {

        document
            .getElementById(
                "albumTitle"
            )
            ?.focus();

    }, 100);
}


/* =====================================================
   CLOSE ADD ALBUM MODAL
===================================================== */

function closeAddAlbumModal() {

    document
        .getElementById(
            "albumModal"
        )
        ?.classList
        .add("hidden");


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

        preview.innerHTML =
            "";
    }


    showMessage(
        "albumMessage",
        ""
    );
}


/* =====================================================
   PHOTO PREVIEW BEFORE UPLOAD
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
                            readerEvent
                                .target
                                .result;


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
   CREATE ALBUM
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


    if (
        !titleElement ||
        !dateElement ||
        !locationElement ||
        !storyElement
    ) {

        console.error(
            "Form album tidak lengkap."
        );

        return;
    }


    const title =
        titleElement
            .value
            .trim();


    /*
        PENTING:

        Input type=date menghasilkan:

        YYYY-MM-DD

        Contoh:

        2026-09-30

        Ini langsung cocok dengan
        kolom PostgreSQL DATE.
    */

    const date =
        dateElement
            .value;


    const location =
        locationElement
            .value
            .trim();


    const story =
        storyElement
            .value
            .trim();


    const files =
        Array.from(
            photoInput?.files || []
        );


    /* =================================================
       VALIDASI
    ================================================= */

    if (!title) {

        showMessage(
            "albumMessage",
            "Nama album wajib diisi."
        );

        return;
    }


    if (!date) {

        showMessage(
            "albumMessage",
            "Tanggal album wajib dipilih."
        );

        return;
    }


    /*
        Validasi format tanggal.
    */

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            date
        )
    ) {

        showMessage(
            "albumMessage",
            "Format tanggal tidak valid."
        );

        return;
    }


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

           INI PERBAIKAN TERPENTING.

           DATABASE:

           title
           date
           location
           story
           cover_url
           cover_path
        ================================================= */


        console.log(
            "Data album yang dikirim:",
            {
                title,
                date,
                location,
                story
            }
        );


        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title: title,

                    date: date,

                    location:
                        location ||
                        null,

                    story:
                        story ||
                        null,

                    cover_url:
                        null,

                    cover_path:
                        null
                })
                .select()
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
                "Album berhasil disimpan tetapi data album tidak diterima."
            );
        }


        console.log(
            "Album berhasil dibuat:",
            album
        );


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
           SET FOTO PERTAMA SEBAGAI COVER
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
                            firstPhoto.foto_url,

                        cover_path:
                            firstPhoto.foto_path
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
                    Album tetap berhasil.
                    Hanya cover yang gagal.
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


        /*
            Refresh setelah sebentar.
        */

        setTimeout(
            async () => {

                closeAddAlbumModal();

                await loadAlbums();

            },
            500
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
   UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    const photoRows =
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

            console.warn(
                "File bukan gambar:",
                file.name
            );

            continue;
        }


        /*
            Batasi ukuran maksimal
            10 MB per foto.
        */

        const maxSize =
            10 * 1024 * 1024;


        if (
            file.size >
            maxSize
        ) {

            throw new Error(
                `Foto "${file.name}" terlalu besar. Maksimal 10 MB.`
            );
        }


        /*
            Nama file aman.
        */

        const safeName =
            file.name
                .replace(
                    /[^a-zA-Z0-9._-]/g,
                    "-"
                );


        const fileName =
            Date.now() +
            "-" +
            i +
            "-" +
            Math.random()
                .toString(36)
                .substring(
                    2,
                    8
                ) +
            "-" +
            safeName;


        /*
            Struktur:

            UUID-ALBUM/
                foto.jpg
                foto2.jpg
        */

        const filePath =
            String(albumId) +
            "/" +
            fileName;


        console.log(
            "Upload:",
            filePath
        );


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
                "UPLOAD ERROR:",
                uploadError
            );


            throw new Error(
                "Upload foto gagal: " +
                uploadError.message
            );
        }


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
                    uploadData.path
                );


        const publicUrl =
            publicUrlData.publicUrl;


        /* =================================================
           PHOTO DATABASE ROW
        ================================================= */


        photoRows.push({

            album_id:
                albumId,

            foto_url:
                publicUrl,

            foto_path:
                uploadData.path
        });
    }


    /* =====================================================
       INSERT PHOTO DATABASE
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
                Hapus file yang
                sudah berhasil upload.
            */

            const paths =
                photoRows
                    .map(
                        photo =>
                            photo.foto_path
                    )
                    .filter(Boolean);


            if (
                paths.length
            ) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
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
   TRIGGER ADD PHOTOS
===================================================== */

function triggerAddPhotos() {

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


    const input =
        document.getElementById(
            "additionalPhotos"
        );


    if (input) {

        input.value =
            "";

        input.click();
    }
}


/* =====================================================
   ADD PHOTOS TO CURRENT ALBUM
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


        /*
            Jika album belum memiliki
            cover, gunakan foto pertama.
        */

        if (
            !currentAlbum.cover_url &&
            newPhotos.length > 0
        ) {

            const firstPhoto =
                newPhotos[0];


            const {
                error
            } =
                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            firstPhoto.foto_url,

                        cover_path:
                            firstPhoto.foto_path
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
                    firstPhoto.foto_url;

                currentAlbum.cover_path =
                    firstPhoto.foto_path;
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
   DELETE PHOTO
===================================================== */

async function hapusFotoAlbum(
    photoId,
    photoPath
) {

    if (!currentUser) {
        return;
    }


    if (!photoId) {
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
            Ambil data foto terlebih
            dahulu agar path tetap ada.
        */

        let path =
            photoPath || "";


        if (!path) {

            const {
                data: photoData
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .select(
                        "foto_path"
                    )
                    .eq(
                        "id",
                        photoId
                    )
                    .maybeSingle();


            path =
                photoData?.foto_path ||
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
            Hapus Storage
        */

        if (path) {

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
                        path
                    ]);


            if (storageError) {

                console.warn(
                    "Storage delete warning:",
                    storageError
                );
            }
        }


        /*
            Jika foto yang dihapus
            adalah cover, cari foto
            berikutnya sebagai cover.
        */

        if (
            currentAlbum &&
            currentAlbum.cover_path ===
            path
        ) {

            const remainingPhotos =
                await getAlbumPhotos(
                    currentAlbum.id
                );


            if (
                remainingPhotos.length > 0
            ) {

                const nextPhoto =
                    remainingPhotos[0];


                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            nextPhoto.foto_url,

                        cover_path:
                            nextPhoto.foto_path
                    })
                    .eq(
                        "id",
                        currentAlbum.id
                    );


                currentAlbum.cover_url =
                    nextPhoto.foto_url;

                currentAlbum.cover_path =
                    nextPhoto.foto_path;


            } else {

                await supabaseClient
                    .from("albums")
                    .update({
                        cover_url:
                            null,

                        cover_path:
                            null
                    })
                    .eq(
                        "id",
                        currentAlbum.id
                    );


                currentAlbum.cover_url =
                    null;

                currentAlbum.cover_path =
                    null;
            }
        }


        /*
            Reload album
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
   DELETE ALBUM
===================================================== */

async function hapusAlbum(
    albumId
) {

    if (!currentUser) {
        return;
    }


    if (!albumId) {
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
            Ambil semua foto
        */

        const photos =
            await getAlbumPhotos(
                albumId
            );


        /*
            Ambil path Storage
        */

        const paths =
            photos
                .map(
                    photo =>
                        photo.foto_path
                )
                .filter(Boolean);


        /*
            Hapus file Storage
        */

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


        /*
            Hapus photo database
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
            Hapus album
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
            Tutup viewer jika album
            yang dihapus sedang dibuka.
        */

        if (
            currentAlbum &&
            String(
                currentAlbum.id
            ) ===
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
   PLAYLIST
===================================================== */

function openPlaylist(
    event
) {

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
   CLOSE MODALS WITH ESCAPE
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
   COMPATIBILITY OLD FUNCTION
===================================================== */

function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


/* =====================================================
   GLOBAL FUNCTIONS
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
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /*
                Pastikan Supabase tersedia.
            */

            if (
                !window.supabase
            ) {

                console.error(
                    "Supabase library belum dimuat."
                );

                return;
            }


            /*
                Update UI awal.
            */

            updateAdminUI();


            /*
                Cek login.
            */

            await checkLogin();


            /*
                Load album.
            */

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
                            Terjadi kesalahan
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