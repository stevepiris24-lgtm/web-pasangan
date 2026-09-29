/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

/*
    GANTI 2 BAGIAN INI

    SUPABASE_URL:
    ambil dari Supabase Project Settings > API

    SUPABASE_KEY:
    gunakan Publishable key / client key
*/

const SUPABASE_URL =
    "GANTI_DENGAN_SUPABASE_URL";

const SUPABASE_KEY =
    "GANTI_DENGAN_SUPABASE_PUBLISHABLE_KEY";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =========================================================
   ELEMENT
========================================================= */

const timelineList =
    document.getElementById("timelineList");

const loginBox =
    document.getElementById("loginBox");

const adminPanel =
    document.getElementById("adminPanel");

const addForm =
    document.getElementById("addForm");


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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "";
    }

    const date =
        new Date(tanggal);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return tanggal;
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


/* =========================================================
   TIME
========================================================= */

function updateTime() {

    const startDate =
        new Date(
            "2024-04-24T00:00:00"
        );

    const now =
        new Date();

    const diff =
        now.getTime() -
        startDate.getTime();

    const days =
        Math.floor(
            diff /
            (
                1000 *
                60 *
                60 *
                24
            )
        );

    const hours =
        Math.floor(
            diff /
            (
                1000 *
                60 *
                60
            )
        );

    const timer =
        document.getElementById("timer");

    const jam =
        document.getElementById("jam");

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

    }
    catch (error) {

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

    if (
        !albums ||
        !albums.length
    ) {

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

               ID TIDAK DIUBAH KE NUMBER
               KARENA BISA BERUPA UUID
            ===================================== */

            const albumPhotos =
                photos.filter(
                    photo =>
                        String(
                            photo.album_id
                        ) ===
                        String(
                            album.id
                        )
                );


            /* =====================================
               COVER ALBUM
            ===================================== */

            let coverHTML = "";


            if (album.cover_url) {

                coverHTML = `
                    <img
                        class="album-cover"
                        src="${escapeHTML(
                            album.cover_url
                        )}"
                        alt="${escapeHTML(
                            album.title
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
                            albumPhotos[0]
                                .foto_url
                        )}"
                        alt="${escapeHTML(
                            album.title
                        )}"
                        loading="lazy"
                    >
                `;

            }
            else {

                coverHTML = `
                    <div class="album-cover-placeholder">
                        📷
                    </div>
                `;
            }


            /* =====================================
               CARD ALBUM
            ===================================== */

            const card =
                document.createElement(
                    "div"
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

                <div class="album-image">

                    ${coverHTML}

                    <div class="album-photo-count">
                        📷
                        ${albumPhotos.length}
                        foto
                    </div>

                </div>


                <div class="album-info">

                    <h3>
                        ${escapeHTML(
                            album.title
                        )}
                    </h3>


                    <div class="album-meta">

                        ${
                            album.tanggal
                            ? `
                                <span>
                                    📅
                                    ${formatTanggal(
                                        album.tanggal
                                    )}
                                </span>
                            `
                            : ""
                        }

                        ${
                            album.lokasi
                            ? `
                                <span>
                                    📍
                                    ${escapeHTML(
                                        album.lokasi
                                    )}
                                </span>
                            `
                            : ""
                        }

                    </div>


                    ${
                        album.cerita
                        ? `
                            <p>
                                ${escapeHTML(
                                    album.cerita
                                )}
                            </p>
                        `
                        : ""
                    }


                    <button
                        type="button"
                        class="view-album-btn"
                    >
                        📷 Lihat Album ❤️
                    </button>

                </div>
            `;


            /* =====================================
               CLICK CARD
            ===================================== */

            card.addEventListener(
                "click",
                function(event) {

                    const button =
                        event.target.closest(
                            ".view-album-btn"
                        );

                    if (button) {

                        event.preventDefault();
                        event.stopPropagation();

                    }

                    openAlbum(
                        album.id
                    );
                }
            );


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

    try {

        if (!albumId) {

            alert(
                "ID album tidak ditemukan."
            );

            return;
        }


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

        if (!album) {

            throw new Error(
                "Album tidak ditemukan."
            );
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

    }
    catch (error) {

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
       FOTO
    ===================================== */

    let photosHTML = "";


    if (
        !photos ||
        !photos.length
    ) {

        photosHTML = `
            <div class="album-empty">

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
                        data-photo-id="${escapeHTML(
                            photo.id
                        )}"
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
                            data-photo-id="${escapeHTML(
                                photo.id
                            )}"
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

        <div class="album-viewer-overlay">

            <div class="album-viewer-content">

                <button
                    type="button"
                    class="album-close-btn"
                    id="closeAlbumButton"
                >
                    ×
                </button>


                <div class="album-viewer-header">

                    <div>

                        <h2>
                            ${escapeHTML(
                                album.title
                            )}
                        </h2>


                        <div class="album-viewer-meta">

                            ${
                                album.tanggal
                                ? `
                                    <span>
                                        📅
                                        ${formatTanggal(
                                            album.tanggal
                                        )}
                                    </span>
                                `
                                : ""
                            }


                            ${
                                album.lokasi
                                ? `
                                    <span>
                                        📍
                                        ${escapeHTML(
                                            album.lokasi
                                        )}
                                    </span>
                                `
                                : ""
                            }

                        </div>

                    </div>


                    <div class="album-viewer-actions">

                        <button
                            type="button"
                            class="add-photo-album-btn"
                            id="addPhotoAlbumButton"
                        >
                            + Tambah Foto ❤️
                        </button>


                        ${
                            document.body.classList.contains(
                                "admin-active"
                            )
                            ? `
                                <button
                                    type="button"
                                    class="delete-album-btn"
                                    id="deleteAlbumButton"
                                >
                                    🗑 Hapus Album
                                </button>
                            `
                            : ""
                        }

                    </div>

                </div>


                ${
                    album.cerita
                    ? `
                        <div class="album-story">
                            ${escapeHTML(
                                album.cerita
                            )}
                        </div>
                    `
                    : ""
                }


                <div class="album-photo-grid">
                    ${photosHTML}
                </div>


                <input
                    type="file"
                    id="albumPhotoInput"
                    accept="image/*"
                    multiple
                    hidden
                >

            </div>

        </div>
    `;


    viewer.classList.add(
        "show"
    );


    /* =====================================
       CLOSE
    ===================================== */

    const closeButton =
        document.getElementById(
            "closeAlbumButton"
        );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAlbum
        );
    }


    /* =====================================
       TAMBAH FOTO
    ===================================== */

    const addPhotoButton =
        document.getElementById(
            "addPhotoAlbumButton"
        );

    const photoInput =
        document.getElementById(
            "albumPhotoInput"
        );


    if (
        addPhotoButton &&
        photoInput
    ) {

        addPhotoButton.addEventListener(
            "click",
            function() {

                photoInput.click();

            }
        );


        photoInput.addEventListener(
            "change",
            async function() {

                const files =
                    Array.from(
                        photoInput.files || []
                    );


                if (!files.length) {
                    return;
                }


                await uploadAlbumPhotos(
                    album.id,
                    files
                );


                photoInput.value =
                    "";
            }
        );
    }


    /* =====================================
       HAPUS FOTO
    ===================================== */

    const deleteButtons =
        viewer.querySelectorAll(
            ".delete-photo-btn"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const photoId =
                        button.getAttribute(
                            "data-photo-id"
                        );


                    await hapusFotoAlbum(
                        photoId,
                        album.id
                    );
                }
            );
        }
    );


    /* =====================================
       HAPUS ALBUM
    ===================================== */

    const deleteAlbumButton =
        document.getElementById(
            "deleteAlbumButton"
        );


    if (deleteAlbumButton) {

        deleteAlbumButton.addEventListener(
            "click",
            async function() {

                await hapusAlbum(
                    album.id
                );
            }
        );
    }
}


/* =========================================================
   CLOSE ALBUM
========================================================= */

function closeAlbum() {

    const viewer =
        document.getElementById(
            "albumViewer"
        );


    if (viewer) {

        viewer.classList.remove(
            "show"
        );


        setTimeout(
            function() {

                if (viewer) {
                    viewer.remove();
                }

            },
            250
        );
    }
}


/* =========================================================
   PREVIEW PHOTO
========================================================= */

function previewPhoto(
    url
) {

    const oldPreview =
        document.querySelector(
            ".photo-preview"
        );


    if (oldPreview) {
        oldPreview.remove();
    }


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "photo-preview";


    preview.innerHTML = `

        <div class="photo-preview-overlay">

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


    preview.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                preview
            ) {

                preview.remove();
            }
        }
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

    const message =
        document.getElementById(
            "formMessage"
        );


    if (
        !judulElement ||
        !tanggalElement ||
        !lokasiElement ||
        !ceritaElement ||
        !fileInput
    ) {

        return;
    }


    const judul =
        judulElement.value.trim();

    const tanggal =
        tanggalElement.value;

    const lokasi =
        lokasiElement.value.trim();

    const cerita =
        ceritaElement.value.trim();

    const files =
        Array.from(
            fileInput.files || []
        );


    /* =====================================
       VALIDASI
    ===================================== */

    if (
        !judul ||
        !tanggal
    ) {

        if (message) {

            message.innerText =
                "Nama album dan tanggal wajib diisi.";
        }

        return;
    }


    if (!files.length) {

        if (message) {

            message.innerText =
                "Pilih minimal 1 foto.";
        }

        return;
    }


    for (
        const file of files
    ) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            if (message) {

                message.innerText =
                    "Semua file harus berupa gambar.";
            }

            return;
        }


        if (
            file.size >
            6 * 1024 * 1024
        ) {

            if (message) {

                message.innerText =
                    "Setiap foto maksimal 6 MB.";
            }

            return;
        }
    }


    /* =====================================
       CEK LOGIN
    ===================================== */

    const {
        data: userData
    } =
        await supabaseClient.auth
            .getUser();


    if (
        !userData ||
        !userData.user
    ) {

        if (message) {

            message.innerText =
                "Sesi admin sudah berakhir.";
        }

        return;
    }


    if (message) {

        message.innerText =
            "Membuat album... ⏳";
    }


    let uploadedFiles = [];

    let createdAlbumId =
        null;


    try {

        /* =================================
           1. BUAT ALBUM
        ================================= */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient

                .from(
                    "albums"
                )

                .insert({

                    /*
                     * PENTING:
                     * Nama kolom database adalah
                     * "title", bukan "judul".
                     */

                    title:
                        judul,

                    tanggal:
                        tanggal,

                    lokasi:
                        lokasi,

                    cerita:
                        cerita
                })

                .select()

                .single();


        if (albumError) {

            throw albumError;
        }


        if (!album) {

            throw new Error(
                "Album gagal dibuat."
            );
        }


        createdAlbumId =
            album.id;


        /* =================================
           2. UPLOAD FOTO
        ================================= */

        const photoRows =
            [];


        for (
            const file of files
        ) {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(
                        2,
                        10
                    ) +
                "." +
                extension;


            const filePath =
                String(
                    createdAlbumId
                ) +
                "/" +
                fileName;


            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient.storage

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
                                false
                        }
                    );


            if (uploadError) {

                throw uploadError;
            }


            uploadedFiles.push(
                uploadData.path
            );


            const {
                data:
                    publicUrlData
            } =
                supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .getPublicUrl(
                        uploadData.path
                    );


            if (
                !publicUrlData ||
                !publicUrlData.publicUrl
            ) {

                throw new Error(
                    "URL foto gagal dibuat."
                );
            }


            photoRows.push({

                album_id:
                    createdAlbumId,

                foto_url:
                    publicUrlData.publicUrl,

                foto_path:
                    uploadData.path

            });
        }


        /* =================================
           3. SIMPAN FOTO KE DATABASE
        ================================= */

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

            throw photoInsertError;
        }


        /* =================================
           4. COVER ALBUM
        ================================= */

        if (
            photoRows.length
        ) {

            const {
                error:
                    coverError
            } =
                await supabaseClient

                    .from(
                        "albums"
                    )

                    .update({

                        cover_url:
                            photoRows[0]
                                .foto_url,

                        cover_path:
                            photoRows[0]
                                .foto_path

                    })

                    .eq(
                        "id",
                        createdAlbumId
                    );


            if (coverError) {

                console.warn(
                    "COVER UPDATE ERROR:",
                    coverError
                );
            }
        }


        /* =================================
           5. BERHASIL
        ================================= */

        if (message) {

            message.innerText =
                "Album berhasil dibuat ❤️";
        }


        /* =================================
           6. RESET FORM
        ================================= */

        judulElement.value =
            "";

        tanggalElement.value =
            "";

        lokasiElement.value =
            "";

        ceritaElement.value =
            "";

        fileInput.value =
            "";


        /* =================================
           7. TUTUP FORM
        ================================= */

        setTimeout(
            function() {

                closeAddForm();

            },
            800
        );


        /* =================================
           8. REFRESH
        ================================= */

        await loadTimeline();


    }
    catch (error) {

        console.error(
            "TAMBAH ALBUM ERROR:",
            error
        );


        /* =================================
           ROLLBACK ALBUM
        ================================= */

        if (
            createdAlbumId
        ) {

            try {

                await supabaseClient

                    .from(
                        "album_photos"
                    )

                    .delete()

                    .eq(
                        "album_id",
                        createdAlbumId
                    );


                await supabaseClient

                    .from(
                        "albums"
                    )

                    .delete()

                    .eq(
                        "id",
                        createdAlbumId
                    );

            }
            catch (
                rollbackError
            ) {

                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }


        /* =================================
           HAPUS FILE STORAGE
        ================================= */

        if (
            uploadedFiles.length
        ) {

            try {

                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove(
                        uploadedFiles
                    );

            }
            catch (
                storageError
            ) {

                console.error(
                    "STORAGE ROLLBACK ERROR:",
                    storageError
                );
            }
        }


        if (message) {

            message.innerText =
                "Album gagal dibuat: " +
                error.message;
        }


        alert(
            "Album gagal dibuat:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   TAMBAH FOTO KE ALBUM
========================================================= */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    try {

        if (!albumId) {

            alert(
                "ID album tidak ditemukan."
            );

            return;
        }


        if (
            !files ||
            !files.length
        ) {

            alert(
                "Pilih minimal satu foto."
            );

            return;
        }


        const photoRows =
            [];

        const uploadedPaths =
            [];


        for (
            const file of files
        ) {

            /* ==============================
               VALIDASI
            ============================== */

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                throw new Error(
                    "File " +
                    file.name +
                    " bukan gambar."
                );
            }


            if (
                file.size >
                6 * 1024 * 1024
            ) {

                throw new Error(
                    "Ukuran " +
                    file.name +
                    " lebih dari 6 MB."
                );
            }


            /* ==============================
               NAMA FILE
            ============================== */

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(
                        2,
                        10
                    ) +
                "." +
                extension;


            const filePath =
                String(
                    albumId
                ) +
                "/" +
                fileName;


            /* ==============================
               UPLOAD STORAGE
            ============================== */

            const {
                data: uploadData,
                error: uploadError
            } =
                await supabaseClient.storage

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
                                false
                        }
                    );


            if (uploadError) {

                throw uploadError;
            }


            uploadedPaths.push(
                uploadData.path
            );


            /* ==============================
               PUBLIC URL
            ============================== */

            const {
                data:
                    publicUrlData
            } =
                supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .getPublicUrl(
                        uploadData.path
                    );


            if (
                !publicUrlData ||
                !publicUrlData.publicUrl
            ) {

                throw new Error(
                    "URL foto gagal dibuat."
                );
            }


            /* ==============================
               DATA DATABASE

               TIDAK MENGGUNAKAN
               Number(albumId)
            ============================== */

            photoRows.push({

                album_id:
                    albumId,

                foto_url:
                    publicUrlData.publicUrl,

                foto_path:
                    uploadData.path

            });
        }


        /* ==============================
           INSERT FOTO
        ============================== */

        const {
            error: insertError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .insert(
                    photoRows
                );


        if (insertError) {

            throw insertError;
        }


        /* ==============================
           CEK COVER ALBUM
        ============================== */

        const {
            data: currentAlbum,
            error: currentAlbumError
        } =
            await supabaseClient

                .from(
                    "albums"
                )

                .select(
                    "cover_url, cover_path"
                )

                .eq(
                    "id",
                    albumId
                )

                .single();


        if (
            !currentAlbumError &&
            currentAlbum &&
            !currentAlbum.cover_url &&
            photoRows.length
        ) {

            await supabaseClient

                .from(
                    "albums"
                )

                .update({

                    cover_url:
                        photoRows[0]
                            .foto_url,

                    cover_path:
                        photoRows[0]
                            .foto_path

                })

                .eq(
                    "id",
                    albumId
                );
        }


        /* ==============================
           BERHASIL
        ============================== */

        alert(
            "Foto berhasil ditambahkan ❤️"
        );


        /* ==============================
           REFRESH ALBUM
        ============================== */

        await openAlbum(
            albumId
        );

        await loadTimeline();


    }
    catch (error) {

        console.error(
            "UPLOAD ALBUM PHOTOS ERROR:",
            error
        );


        /* ==============================
           ROLLBACK STORAGE
        ============================== */

        if (
            uploadedPaths.length
        ) {

            try {

                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove(
                        uploadedPaths
                    );

            }
            catch (
                storageError
            ) {

                console.error(
                    "STORAGE ROLLBACK ERROR:",
                    storageError
                );
            }
        }


        alert(
            "Foto gagal ditambahkan:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   HAPUS FOTO ALBUM
========================================================= */

async function hapusFotoAlbum(
    photoId,
    albumId
) {

    if (!photoId) {
        return;
    }


    const yakin =
        confirm(
            "Hapus foto ini dari album?"
        );


    if (!yakin) {
        return;
    }


    try {

        /* =================================
           AMBIL DATA FOTO
        ================================= */

        const {
            data: photo,
            error: photoError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .select("*")

                .eq(
                    "id",
                    photoId
                )

                .single();


        if (photoError) {
            throw photoError;
        }


        /* =================================
           HAPUS STORAGE
        ================================= */

        if (
            photo &&
            photo.foto_path
        ) {

            const {
                error:
                    storageError
            } =
                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove([
                        photo.foto_path
                    ]);


            if (storageError) {

                console.warn(
                    "STORAGE DELETE ERROR:",
                    storageError
                );
            }
        }


        /* =================================
           HAPUS DATABASE
        ================================= */

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
            throw deleteError;
        }


        /* =================================
           REFRESH
        ================================= */

        await openAlbum(
            albumId
        );

        await loadTimeline();


    }
    catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );


        alert(
            "Foto gagal dihapus:\n" +
            error.message
        );
    }
}


/* =========================================================
   HAPUS ALBUM
========================================================= */

async function hapusAlbum(
    albumId
) {

    if (!albumId) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus album ini beserta semua fotonya?"
        );


    if (!yakin) {
        return;
    }


    try {

        /* =================================
           AMBIL FOTO
        ================================= */

        const {
            data: photos,
            error: photoError
        } =
            await supabaseClient

                .from(
                    "album_photos"
                )

                .select(
                    "foto_path"
                )

                .eq(
                    "album_id",
                    albumId
                );


        if (photoError) {
            throw photoError;
        }


        /* =================================
           HAPUS STORAGE
        ================================= */

        const paths =
            (photos || [])
                .map(
                    photo =>
                        photo.foto_path
                )
                .filter(
                    path =>
                        !!path
                );


        if (
            paths.length
        ) {

            const {
                error:
                    storageError
            } =
                await supabaseClient.storage

                    .from(
                        STORAGE_BUCKET
                    )

                    .remove(
                        paths
                    );


            if (storageError) {

                console.warn(
                    "STORAGE DELETE ERROR:",
                    storageError
                );
            }
        }


        /* =================================
           HAPUS FOTO DATABASE
        ================================= */

        const {
            error:
                deletePhotoError
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
            deletePhotoError
        ) {

            throw deletePhotoError;
        }


        /* =================================
           HAPUS ALBUM
        ================================= */

        const {
            error:
                deleteAlbumError
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
            deleteAlbumError
        ) {

            throw deleteAlbumError;
        }


        /* =================================
           REFRESH
        ================================= */

        closeAlbum();

        await loadTimeline();


        alert(
            "Album berhasil dihapus ❤️"
        );


    }
    catch (error) {

        console.error(
            "DELETE ALBUM ERROR:",
            error
        );


        alert(
            "Album gagal dihapus:\n" +
            error.message
        );
    }
}


/* =========================================================
   OPEN ADD FORM
========================================================= */

function openAddForm() {

    if (!addForm) {
        return;
    }


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


    const message =
        document.getElementById(
            "formMessage"
        );


    if (message) {

        message.innerText =
            "";
    }
}


/* =========================================================
   SCROLL GALERI
========================================================= */

function scrollToGallery() {

    if (!timelineList) {
        return;
    }


    timelineList.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"
    });
}


/* =========================================================
   AUTH STATE
========================================================= */

supabaseClient.auth

    .onAuthStateChange(
        (
            event,
            session
        ) => {

            if (
                session &&
                session.user
            ) {

                updateAdminUI(
                    session.user
                );

            }
            else {

                updateAdminUI(
                    null
                );
            }
        }
    );


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            const preview =
                document.querySelector(
                    ".photo-preview"
                );


            if (preview) {

                preview.remove();

                return;
            }


            const viewer =
                document.getElementById(
                    "albumViewer"
                );


            if (viewer) {

                closeAlbum();
            }
        }
    }
);


/* =========================================================
   EXPOSE FUNCTION
   Supaya HTML onclick="..." tetap berfungsi
========================================================= */

window.openAlbum =
    openAlbum;

window.closeAlbum =
    closeAlbum;

window.previewPhoto =
    previewPhoto;

window.openAddForm =
    openAddForm;

window.closeAddForm =
    closeAddForm;

window.loginAdmin =
    loginAdmin;

window.logoutAdmin =
    logoutAdmin;

window.tambahAlbum =
    tambahAlbum;


/*
    PENTING:

    HTML kamu menggunakan:

    onclick="tambahKenangan()"

    Karena fungsi utama kita bernama tambahAlbum(),
    kita buat alias agar tombol HTML tetap berfungsi.
*/

window.tambahKenangan =
    tambahAlbum;

window.uploadAlbumPhotos =
    uploadAlbumPhotos;

window.hapusFotoAlbum =
    hapusFotoAlbum;

window.hapusAlbum =
    hapusAlbum;

window.scrollToGallery =
    scrollToGallery;


/* =========================================================
   START WEBSITE
========================================================= */

checkLogin();

loadTimeline();