/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://lzuqaqysqmavxxstifjy.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_XAbDjSXAHywqAGJ4eWz3OA_iO5PDNiF";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   SUPABASE STORAGE
========================================================= */

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =========================================================
   HUBUNGAN
========================================================= */

const startDate =
    new Date("2024-04-24");


const texts = [

    "Setiap hari bersamamu adalah rumah.",

    "Kamu adalah tempat pulang terbaikku.",

    "Bersamamu, semua terasa cukup.",

    "Aku memilihmu setiap hari ❤️",

    "Kita, selamanya bukan sekadar kata."

];


let textIndex = 0;


/* =========================================================
   ELEMENT
========================================================= */

const timelineList =
    document.getElementById(
        "timelineList"
    );

const addForm =
    document.getElementById(
        "addForm"
    );

const loginBox =
    document.getElementById(
        "loginBox"
    );

const adminPanel =
    document.getElementById(
        "adminPanel"
    );


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

/* =========================================================
   NORMALISASI ID ALBUM
   Mendukung UUID maupun ID angka.
   Jangan gunakan Number() untuk UUID.
========================================================= */

function normalizeId(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();

}



/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatTanggal(
    tanggal
) {

    if (!tanggal) {

        return "";

    }

    const date =
        new Date(
            `${tanggal}T00:00:00`
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT JUMLAH FOTO
========================================================= */

function formatJumlahFoto(
    jumlah
) {

    if (
        Number(jumlah) === 1
    ) {

        return "1 foto";

    }

    return `${jumlah} foto`;

}


/* =========================================================
   HERO TEXT
========================================================= */

function changeText() {

    const el =
        document.getElementById(
            "dynamicText"
        );


    if (!el) {

        return;

    }


    el.style.opacity = 0;


    setTimeout(() => {

        el.innerText =
            texts[textIndex];


        el.style.opacity = 1;


        textIndex =
            (textIndex + 1) %
            texts.length;

    }, 500);

}


setInterval(
    changeText,
    3000
);


/* =========================================================
   TIMER
========================================================= */

function updateTime() {

    const now =
        new Date();


    const diff =
        now - startDate;


    const days =
        Math.floor(
            diff /
            (1000 * 60 * 60 * 24)
        );


    const hours =
        Math.floor(
            diff /
            (1000 * 60 * 60)
        );


    const timer =
        document.getElementById(
            "timer"
        );


    const jam =
        document.getElementById(
            "jam"
        );


    if (timer) {

        timer.innerText =
            `Sejak 24 April 2024 — sudah ${days} hari bersama ❤️`;

    }


    if (jam) {

        jam.innerText =
            `${hours.toLocaleString("id-ID")} jam bersama ⏳`;

    }

}


updateTime();


setInterval(
    updateTime,
    1000
);


/* =========================================================
   LOAD ALBUM
========================================================= */

async function loadTimeline() {

    if (!timelineList) {

        return;

    }


    timelineList.innerHTML = `

        <div class="loading">

            Memuat album cerita kita... ❤️

        </div>

    `;


    try {

        /* =========================================
           AMBIL ALBUM
        ========================================= */

        const {
            data: albums,
            error: albumError
        } =
            await supabaseClient

                .from("albums")

                .select("*")

                .order(
                    "tanggal",
                    {
                        ascending: true
                    }
                );


        if (albumError) {

            throw albumError;

        }


        /* =========================================
           AMBIL FOTO
        ========================================= */

        const {
            data: photos,
            error: photoError
        } =
            await supabaseClient

                .from("album_photos")

                .select("*")

                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (photoError) {

            throw photoError;

        }


        renderAlbums(
            albums || [],
            photos || []
        );


    } catch (error) {

        console.error(
            "LOAD ALBUM ERROR:",
            error
        );


        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Gagal memuat album
                </strong>

                <span>
                    ${escapeHTML(
                        error.message
                    )}
                </span>

            </div>

        `;

    }

}


/* =========================================================
   RENDER ALBUM
========================================================= */

function renderAlbums(
    albums,
    photos
) {

    if (!albums.length) {

        timelineList.innerHTML = `

            <div class="empty-state">

                <strong>
                    Belum ada album ❤️
                </strong>

                <span>
                    Login sebagai admin untuk membuat album pertama.
                </span>

            </div>

        `;

        return;

    }


    timelineList.innerHTML = "";


    albums.forEach(
        album => {

            /* =====================================
               FOTO ALBUM
            ===================================== */

            const albumPhotos =
                photos.filter(
                    photo =>
                        normalizeId(
                            photo.album_id
                        ) ===
                        normalizeId(
                            album.id
                        )
                );


            /* =====================================
               COVER
            ===================================== */

            let coverHTML = "";


            if (
                album.cover_url
            ) {

                coverHTML = `

                    <img
                        class="album-cover"
                        src="${escapeHTML(
                            album.cover_url
                        )}"
                        alt="${escapeHTML(
                            album.judul
                        )}"
                        loading="lazy"
                    >

                `;

            }

            else if (
                albumPhotos.length
            ) {

                coverHTML = `

                    <img
                        class="album-cover"
                        src="${escapeHTML(
                            albumPhotos[0].foto_url
                        )}"
                        alt="${escapeHTML(
                            album.judul
                        )}"
                        loading="lazy"
                    >

                `;

            }

            else {

                coverHTML = `

                    <div
                        class="album-cover album-no-photo"
                    >
                        ❤️
                    </div>

                `;

            }


            /* =====================================
               CARD
            ===================================== */

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "album-card";


            card.setAttribute(
                "data-album-id",
                album.id
            );


            card.setAttribute(
                "tabindex",
                "0"
            );


            card.innerHTML = `

                <div
                    class="album-cover-wrapper"
                >

                    ${coverHTML}

                    <div
                        class="album-photo-count"
                    >

                        📷
                        ${formatJumlahFoto(
                            albumPhotos.length
                        )}

                    </div>

                </div>


                <div
                    class="album-content"
                >

                    <div
                        class="album-date"
                    >

                        ${formatTanggal(
                            album.tanggal ||
                            album.created_at
                        )}

                    </div>


                    <h3>

                        ${escapeHTML(
                            album.judul
                        )}

                    </h3>


                    ${
                        album.lokasi
                        ?
                        `
                        <div
                            class="album-location"
                        >

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
                        <p
                            class="album-story"
                        >

                            ${escapeHTML(
                                album.cerita
                            )}

                        </p>
                        `
                        :
                        ""
                    }


                    <button
                        type="button"
                        class="album-open-btn"
                    >

                        📷 Lihat Album ❤️

                    </button>


                    <button
                        type="button"
                        class="delete-album-btn"
                    >

                        🗑 Hapus Album

                    </button>

                </div>

            `;


            /* =====================================
               KLIK CARD
            ===================================== */

            card.addEventListener(
                "click",
                function(event) {

                    /*
                       Jangan buka album jika
                       tombol hapus yang diklik.
                    */

                    if (
                        event.target.closest(
                            ".delete-album-btn"
                        )
                    ) {

                        return;

                    }


                    openAlbum(
                        album.id
                    );

                }
            );


            /* =====================================
               TOMBOL LIHAT ALBUM
            ===================================== */

            const openButton =
                card.querySelector(
                    ".album-open-btn"
                );


            if (openButton) {

                openButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        openAlbum(
                            album.id
                        );

                    }
                );

            }


            /* =====================================
               TOMBOL HAPUS ALBUM
            ===================================== */

            const deleteButton =
                card.querySelector(
                    ".delete-album-btn"
                );


            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        event.stopPropagation();


                        hapusAlbum(
                            album.id
                        );

                    }
                );

            }


            /* =====================================
               KEYBOARD
            ===================================== */

            card.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        openAlbum(
                            album.id
                        );

                    }

                }
            );


            timelineList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   OPEN ALBUM
========================================================= */

async function openAlbum(
    albumId
) {

    albumId = normalizeId(albumId);

    if (!albumId) {
        alert("ID album tidak ditemukan.");
        return;
    }

    try {

        /* =====================================
           AMBIL ALBUM
        ===================================== */

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

            throw albumError;

        }


        /* =====================================
           AMBIL FOTO
        ===================================== */

        const {
            data: photos,
            error: photoError
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


        if (photoError) {

            throw photoError;

        }


        /* =====================================
           TAMPILKAN ALBUM
        ===================================== */

        showAlbumViewer(
            album,
            photos || []
        );


    } catch (error) {

        console.error(
            "OPEN ALBUM ERROR:",
            error
        );


        alert(
            "Gagal membuka album:\n" +
            error.message
        );

    }

}


/* =========================================================
   ALBUM VIEWER
========================================================= */

function showAlbumViewer(
    album,
    photos
) {

    let viewer =
        document.getElementById(
            "albumViewer"
        );


    /* =====================================
       BUAT VIEWER JIKA BELUM ADA
    ===================================== */

    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "albumViewer";


        viewer.className =
            "album-viewer";


        document.body.appendChild(
            viewer
        );

    }


    /* =====================================
       BUAT FOTO
    ===================================== */

    let photosHTML = "";


    if (!photos.length) {

        photosHTML = `

            <div
                class="album-empty"
            >

                <div>
                    📷
                </div>

                <strong>
                    Belum ada foto
                </strong>

                <span>
                    Tambahkan foto pertama
                    ke album ini ❤️
                </span>

            </div>

        `;

    }

    else {

        photos.forEach(
            photo => {

                photosHTML += `

                    <div
                        class="album-photo-item"
                        data-photo-id="${photo.id}"
                    >

                        <img
                            src="${escapeHTML(
                                photo.foto_url
                            )}"
                            alt="Foto album"
                            loading="lazy"
                            class="album-photo-image"
                        >


                        <button
                            type="button"
                            class="delete-photo-btn"
                            data-photo-id="${photo.id}"
                        >

                            ×

                        </button>

                    </div>

                `;

            }
        );

    }


    /* =====================================
       VIEWER HTML
    ===================================== */

    viewer.innerHTML = `

        <div
            class="album-viewer-overlay"
            id="albumViewerOverlay"
        >

            <div
                class="album-viewer-content"
            >

                <button
                    type="button"
                    class="album-close-btn"
                    id="albumCloseBtn"
                >

                    ×

                </button>


                <div
                    class="album-viewer-header"
                >

                    <div>

                        <div
                            class="album-viewer-date"
                        >

                            ${formatTanggal(
                                album.tanggal ||
                                album.created_at
                            )}

                        </div>


                        <h2>

                            ${escapeHTML(
                                album.judul
                            )}

                        </h2>


                        ${
                            album.lokasi
                            ?
                            `
                            <p>

                                📍
                                ${escapeHTML(
                                    album.lokasi
                                )}

                            </p>
                            `
                            :
                            ""
                        }

                    </div>

                </div>


                ${
                    album.cerita
                    ?
                    `
                    <div
                        class="album-viewer-story"
                    >

                        ${escapeHTML(
                            album.cerita
                        )}

                    </div>
                    `
                    :
                    ""
                }


                <div
                    class="album-photo-grid"
                    id="albumPhotoGrid"
                >

                    ${photosHTML}

                </div>


                <!-- =================================
                     UPLOAD FOTO
                ================================= -->

                <div
                    class="album-admin-upload"
                >

                    <div
                        class="upload-title"
                    >

                        📷 Tambahkan Foto

                    </div>


                    <div
                        class="upload-description"
                    >

                        Pilih satu atau beberapa
                        foto sekaligus.

                    </div>


                    <input
                        type="file"
                        id="albumPhotos"
                        accept="image/*"
                        multiple
                    >


                    <button
                        type="button"
                        id="uploadAlbumButton"
                        class="add-photo-btn"
                    >

                        + Tambah Foto ❤️

                    </button>


                    <div
                        id="albumUploadMessage"
                        class="album-upload-message"
                    ></div>

                </div>

            </div>

        </div>

    `;


    /* =====================================
       TAMPILKAN
    ===================================== */

    requestAnimationFrame(
        () => {

            viewer.classList.add(
                "show"
            );

        }
    );


    document.body.style.overflow =
        "hidden";


    /* =====================================
       CLOSE BUTTON
    ===================================== */

    const closeButton =
        document.getElementById(
            "albumCloseBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAlbum
        );

    }


    /* =====================================
       KLIK AREA LUAR
    ===================================== */

    const overlay =
        document.getElementById(
            "albumViewerOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    overlay
                ) {

                    closeAlbum();

                }

            }
        );

    }


    /* =====================================
       TOMBOL UPLOAD
    ===================================== */

    const uploadButton =
        document.getElementById(
            "uploadAlbumButton"
        );


    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            function() {

                uploadAlbumPhotos(
                    album.id
                );

            }
        );

    }


    /* =====================================
       FOTO
    ===================================== */

    const photoImages =
        viewer.querySelectorAll(
            ".album-photo-image"
        );


    photoImages.forEach(
        image => {

            image.addEventListener(
                "click",
                function() {

                    previewPhoto(
                        image.src
                    );

                }
            );

        }
    );


    /* =====================================
       DELETE FOTO
    ===================================== */

    const deleteButtons =
        viewer.querySelectorAll(
            ".delete-photo-btn"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const photoId =
                        button.dataset.photoId;


                    hapusFotoAlbum(
                        photoId
                    );

                }
            );

        }
    );

}


/* =========================================================
   CLOSE ALBUM
========================================================= */

function closeAlbum() {

    const viewer =
        document.getElementById(
            "albumViewer"
        );


    if (!viewer) {

        return;

    }


    viewer.classList.remove(
        "show"
    );


    setTimeout(
        () => {

            viewer.innerHTML =
                "";


            document.body.style.overflow =
                "";

        },
        250
    );

}


/* =========================================================
   PREVIEW FOTO
========================================================= */

function previewPhoto(
    url
) {

    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "photo-preview";


    preview.innerHTML = `

        <div
            class="photo-preview-overlay"
        >

            <button
                type="button"
                class="photo-preview-close"
            >

                ×

            </button>


            <img
                src="${escapeHTML(
                    url
                )}"
                alt="Preview foto"
            >

        </div>

    `;


    document.body.appendChild(
        preview
    );


    /* =====================================
       CLOSE PREVIEW
    ===================================== */

    const overlay =
        preview.querySelector(
            ".photo-preview-overlay"
        );


    const closeButton =
        preview.querySelector(
            ".photo-preview-close"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function() {

                preview.remove();

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    overlay
                ) {

                    preview.remove();

                }

            }
        );

    }

}


/* =========================================================
   OPEN ADD FORM
========================================================= */

async function openAddForm() {

    const {
        data
    } =
        await supabaseClient.auth
            .getUser();


    if (
        !data ||
        !data.user
    ) {

        if (loginBox) {

            loginBox.classList.add(
                "show"
            );


            loginBox.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

        }


        showLoginMessage(
            "Login admin terlebih dahulu."
        );


        return;

    }


    prepareAlbumForm();


    if (addForm) {

        addForm.classList.add(
            "show"
        );


        addForm.scrollIntoView({
            behavior:
                "smooth",

            block:
                "center"
        });

    }

}


/* =========================================================
   PREPARE FORM ALBUM
========================================================= */

function prepareAlbumForm() {

    if (!addForm) {

        return;

    }


    const title =
        addForm.querySelector(
            ".form-title"
        );


    if (title) {

        title.innerHTML =
            "Buat Album Baru ❤️";

    }


    const labels =
        addForm.querySelectorAll(
            "label"
        );


    if (
        labels.length >= 5
    ) {

        labels[0].innerText =
            "Nama Album";

        labels[1].innerText =
            "Tanggal";

        labels[2].innerText =
            "Lokasi";

        labels[3].innerText =
            "Cerita Album";

        labels[4].innerText =
            "Foto Album";

    }


    const judul =
        document.getElementById(
            "judul"
        );


    if (judul) {

        judul.placeholder =
            "Contoh: Perjalanan Pertama Kita";

    }


    const cerita =
        document.getElementById(
            "cerita"
        );


    if (cerita) {

        cerita.placeholder =
            "Ceritakan tentang album ini...";

    }


    const foto =
        document.getElementById(
            "foto"
        );


    if (foto) {

        foto.multiple =
            true;

        foto.accept =
            "image/*";

    }


    const saveButton =
        addForm.querySelector(
            ".save-btn"
        );


    if (saveButton) {

        saveButton.innerText =
            "Buat Album ❤️";


        saveButton.onclick =
            tambahAlbum;

    }

}


/* =========================================================
   CLOSE ADD FORM
========================================================= */

function closeAddForm() {

    if (!addForm) {

        return;

    }


    addForm.classList.remove(
        "show"
    );

}


/* =========================================================
   LOGIN ADMIN
========================================================= */

async function loginAdmin() {

    const emailInput =
        document.getElementById(
            "adminEmail"
        );


    const passwordInput =
        document.getElementById(
            "adminPassword"
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


    if (
        !email ||
        !password
    ) {

        showLoginMessage(
            "Email dan password harus diisi."
        );


        return;

    }


    showLoginMessage(
        "Sedang login..."
    );


    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email:
                    email,

                password:
                    password

            });


    if (error) {

        console.error(
            error
        );


        showLoginMessage(
            "Login gagal: " +
            error.message
        );


        return;

    }


    updateAdminUI(
        data.user
    );


    showLoginMessage(
        "Login berhasil ❤️"
    );


    passwordInput.value =
        "";

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message
) {

    const el =
        document.getElementById(
            "loginMessage"
        );


    if (el) {

        el.innerText =
            message;

    }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    await supabaseClient.auth
        .signOut();


    closeAddForm();


    updateAdminUI(
        null
    );

}


/* =========================================================
   ADMIN UI
========================================================= */

function updateAdminUI(
    user
) {

    if (user) {

        if (loginBox) {

            loginBox.classList.remove(
                "show"
            );

        }


        if (adminPanel) {

            adminPanel.classList.add(
                "show"
            );

        }


        const emailText =
            document.getElementById(
                "adminEmailText"
            );


        if (emailText) {

            emailText.innerText =
                user.email || "";

        }


        document.body.classList.add(
            "admin-active"
        );

    }

    else {

        if (adminPanel) {

            adminPanel.classList.remove(
                "show"
            );

        }


        document.body.classList.remove(
            "admin-active"
        );

    }

}


/* =========================================================
   CHECK LOGIN
========================================================= */

async function checkLogin() {

    const {
        data
    } =
        await supabaseClient.auth
            .getUser();


    if (
        data &&
        data.user
    ) {

        updateAdminUI(
            data.user
        );

    }

    else {

        updateAdminUI(
            null
        );

    }

}


/* =========================================================
   TAMBAH ALBUM
========================================================= */

async function tambahAlbum() {

    const judulElement =
        document.getElementById(
            "judul"
        );


    const tanggalElement =
        document.getElementById(
            "tanggal"
        );


    const lokasiElement =
        document.getElementById(
            "lokasi"
        );


    const ceritaElement =
        document.getElementById(
            "cerita"
        );


    const fileInput =
        document.getElementById(
            "foto"
        );