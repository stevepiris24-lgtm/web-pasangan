/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


/* =====================================================
   STORAGE
===================================================== */

const STORAGE_BUCKET = "ALBUM-PHOTOS";


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
   UTILITY - FORMAT TANGGAL
===================================================== */

function formatTanggal(dateValue) {

    if (!dateValue) {
        return "-";
    }

    /*
        Database menggunakan kolom:
        date

        Format:
        YYYY-MM-DD
    */

    const date =
        new Date(
            dateValue + "T00:00:00"
        );

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
   UTILITY - SHOW MESSAGE
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

    const emailInput =
        document.getElementById(
            "loginEmail"
        );

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );

    if (!emailInput || !passwordInput) {
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
            data.user || null;

        updateAdminUI();

        closeLoginModal();

        emailInput.value = "";
        passwordInput.value = "";

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
        }

    } catch (error) {

        console.error(
            "LOGOUT EXCEPTION:",
            error
        );

    } finally {

        currentUser = null;

        updateAdminUI();

        closeAlbumViewer();

        await loadAlbums();
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

            currentUser = null;

        } else {

            currentUser =
                data.session?.user ||
                null;
        }

    } catch (error) {

        console.error(
            "CHECK LOGIN ERROR:",
            error
        );

        currentUser = null;
    }

    updateAdminUI();
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
   SUPABASE AUTH LISTENER
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

    list.innerHTML = `
        <div class="loading">
            Memuat cerita kita...
        </div>
    `;

    try {

        /*
            =================================================
            PENTING

            DATABASE MENGGUNAKAN KOLOM:

            date

            BUKAN:

            tanggal
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

            list.innerHTML = `
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

        list.innerHTML = `
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
            "GET ALBUM PHOTOS ERROR:",
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

    if (!albums || !albums.length) {

        list.innerHTML = `
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


        const firstPhoto =
            photos.length > 0
                ? photos[0].foto_url
                : (
                    album.cover_url ||
                    ""
                );


        const title =
            album.title ||
            album.judul ||
            "Tanpa Judul";


        const item =
            document.createElement(
                "article"
            );


        item.className =
            "timeline-item";


        item.innerHTML = `
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


    content.innerHTML = `
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

            console.error(
                "OPEN ALBUM ERROR:",
                albumError
            );

            content.innerHTML = `
                <div class="empty-state">

                    Gagal membuka album.

                    <br><br>

                    ${escapeHTML(
                        albumError.message
                    )}

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

        content.innerHTML = `
            <div class="empty-state">

                Gagal membuka album.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

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
        album.judul ||
        "Tanpa Judul";


    content.innerHTML = `

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
                photos &&
                photos.length
                ?
                photos.map(
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
                                        type="button"
                                        class="delete-photo-button"
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
   PHOTO PREVIEW
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


    win.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Foto Kenangan ❤️
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    width: 100%;
                    height: 100%;
                    background: #050507;
                }

                body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                img {
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 16px;
                }

            </style>

        </head>

        <body>

            <img
                src="${escapeHTML(url)}"
                alt="Foto"
            >

        </body>

        </html>
    `);

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
}


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


    const message =
        document.getElementById(
            "albumMessage"
        );

    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";
    }
}


/* =====================================================
   PHOTO PREVIEW BEFORE UPLOAD
===================================================== */

document.addEventListener(
    "change",
    event => {

        if (
            !event.target ||
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


                        item.innerHTML = `
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
        !dateInput ||
        !locationInput ||
        !storyInput
    ) {

        alert(
            "Form album tidak ditemukan."
        );

        return;
    }


    const title =
        titleInput.value.trim();


    /*
        =================================================
        PENTING

        Ambil nilai tanggal dari:

        id="albumDate"

        lalu simpan ke database
        dengan nama kolom:

        date
        =================================================
    */

    const date =
        dateInput.value;


    const lokasi =
        locationInput.value.trim();


    const cerita =
        storyInput.value.trim();


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


    /* =================================================
       BUTTON
    ================================================= */

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


    let createdAlbum =
        null;


    try {

        /* =================================================
           STEP 1
           INSERT ALBUM

           PERBAIKAN UTAMA:

           date: date

           BUKAN:

           tanggal: date
        ================================================= */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert({
                    title: title,

                    /*
                        Dipertahankan untuk
                        kompatibilitas apabila
                        kolom judul memang ada.
                    */
                    judul: title,

                    /*
                        INI PERBAIKAN UTAMA
                    */
                    date: date,

                    lokasi:
                        lokasi || null,

                    cerita:
                        cerita || null,

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


        createdAlbum =
            album;


        /* =================================================
           STEP 2
           UPLOAD FOTO
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
           UPDATE COVER
        ================================================= */

        if (
            uploadedPhotos.length >
            0
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
            Jika album sudah berhasil
            dibuat tetapi upload foto gagal,
            album tetap ada.

            Kita beri pesan yang jelas.
        */

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

    if (!albumId) {

        throw new Error(
            "ID album tidak ditemukan."
        );
    }


    if (
        !files ||
        !files.length
    ) {

        return [];
    }


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

            continue;
        }


        /* =================================================
           VALIDASI UKURAN FOTO

           Maksimal 10 MB per foto
        ================================================= */

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


        /* =================================================
           NAMA FILE
        ================================================= */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const originalName =
            file.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    "-"
                );


        const fileName =
            Date.now() +
            "-" +
            i +
            "-" +
            originalName +
            "." +
            extension;


        /*
            Folder berdasarkan UUID album
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
                "UPLOAD ERROR:",
                uploadError
            );


            throw new Error(
                "Upload foto gagal: " +
                uploadError.message
            );
        }


        /* =================================================
           PUBLIC URL
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
           SIMPAN DATA FOTO
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


    /* =================================================
       INSERT FOTO KE DATABASE
    ================================================= */

    if (
        photoRows.length >
        0
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
                Hapus file storage
                jika insert database gagal.
            */

            for (
                const photo
                of photoRows
            ) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove([
                        photo.foto_path
                    ]);
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
   ADD PHOTOS TO EXISTING ALBUM
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
            Kalau album belum punya cover,
            foto pertama menjadi cover.
        */

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
                            newPhotos[0]
                                .foto_url,

                        cover_path:
                            newPhotos[0]
                                .foto_path
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
                    newPhotos[0]
                        .foto_url;

                currentAlbum.cover_path =
                    newPhotos[0]
                        .foto_path;
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

        /* =================================================
           STEP 1
           DELETE DATABASE
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
           STEP 2
           DELETE STORAGE
        ================================================= */

        if (photoPath) {

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
                        photoPath
                    ]);


            if (storageError) {

                console.warn(
                    "STORAGE DELETE WARNING:",
                    storageError
                );
            }
        }


        /* =================================================
           STEP 3
           RELOAD ALBUM
        ================================================= */

        if (
            currentAlbum &&
            currentAlbum.id
        ) {

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

        /* =================================================
           STEP 1
           GET PHOTOS
        ================================================= */

        const photos =
            await getAlbumPhotos(
                albumId
            );


        /* =================================================
           STEP 2
           GET STORAGE PATHS
        ================================================= */

        const paths =
            photos
                .map(
                    photo =>
                        photo.foto_path
                )
                .filter(
                    Boolean
                );


        /* =================================================
           STEP 3
           DELETE STORAGE
        ================================================= */

        if (
            paths.length >
            0
        ) {

            const {
                error:
                    storageDeleteError
            } =
                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
                    );


            if (
                storageDeleteError
            ) {

                console.warn(
                    "STORAGE DELETE WARNING:",
                    storageDeleteError
                );
            }
        }


        /* =================================================
           STEP 4
           DELETE PHOTOS DATABASE
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
           STEP 5
           DELETE ALBUM
        ================================================= */

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


        /* =================================================
           RELOAD
        ================================================= */

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
   CLOSE MODAL WITH ESCAPE
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
   CLOSE MODAL WHEN CLICKING BACKDROP
===================================================== */

document.addEventListener(
    "click",
    event => {

        /*
            Tidak melakukan apa-apa
            jika klik bukan overlay.
        */

        if (
            event.target.classList &&
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            const modal =
                event.target.closest(
                    ".modal"
                );


            if (!modal) {
                return;
            }


            if (
                modal.id ===
                "loginModal"
            ) {

                closeLoginModal();

            } else if (
                modal.id ===
                "albumModal"
            ) {

                closeAddAlbumModal();

            } else if (
                modal.id ===
                "albumViewer"
            ) {

                closeAlbumViewer();

            } else if (
                modal.id ===
                "playlistModal"
            ) {

                closePlaylist();
            }
        }
    }
);


/* =====================================================
   COMPATIBILITY WITH OLD HTML
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

        /*
            Pastikan Supabase
            sudah dikonfigurasi.
        */

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

                list.innerHTML = `
                    <div class="empty-state">

                        <strong>
                            Supabase belum dikonfigurasi
                        </strong>

                        <p>
                            Buka script.js lalu
                            masukkan Supabase URL
                            dan Publishable Key.
                        </p>

                    </div>
                `;
            }


            return;
        }


        /*
            Update tampilan admin
        */

        updateAdminUI();


        /*
            Cek session login
        */

        await checkLogin();


        /*
            Load semua album
        */

        await loadAlbums();

    }
);