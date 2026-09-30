/* =========================================================
   UNTUK LILA ❤️
   SCRIPT.JS - CLEAN FINAL VERSION
   SUPABASE ALBUM SYSTEM

   DATABASE:

   albums
   --------------------------------
   id
   title
   tanggal
   lokasi
   cerita
   cover_url
   created_at

   album_photos
   --------------------------------
   id
   album_id
   foto_url
   created_at

   STORAGE
   --------------------------------
   ALBUM-PHOTOS

   PENTING:
   - TIDAK menggunakan foto_path
   - TIDAK menggunakan cover_path
   - TIDAK menggunakan album.date
   - TIDAK menggunakan album.judul
========================================================= */


/* =========================================================
   1. SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =========================================================
   2. SUPABASE CLIENT
========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================================
   3. GLOBAL STATE
========================================================= */

let currentUser = null;

let currentAlbum = null;

let albumsCache = [];

let albumPhotosCache = [];


/* =========================================================
   4. HERO TEXT
========================================================= */

const heroTexts = [
    "Setiap hari bersamamu adalah rumah. ❤️",
    "Bersamamu, semua terasa cukup.",
    "Kita mungkin sederhana, tapi cerita kita istimewa.",
    "Terima kasih sudah menjadi bagian dari hidupku.",
    "Semoga cerita kita selalu punya halaman baru.",
    "Aku suka semua cerita yang melibatkan kita.",
    "Dari sekian banyak tempat, rumahku tetap kamu.",
    "Kalau ada kamu, semuanya terasa lebih baik. ❤️"
];

let heroTextIndex = 0;


/* =========================================================
   5. HERO TEXT BERGANTI
========================================================= */

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

    }, 400);
}


setInterval(
    changeHeroText,
    5000
);


/* =========================================================
   6. ESCAPE HTML
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
   7. FORMAT TANGGAL
========================================================= */

function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    let date;

    /*
        Database:
        YYYY-MM-DD
    */

    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        date =
            new Date(
                value + "T00:00:00"
            );

    } else {

        date =
            new Date(value);
    }

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(value);
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   8. MESSAGE HELPER
========================================================= */

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


/* =========================================================
   9. TIME TOGETHER
========================================================= */

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


/* =========================================================
   10. LOGIN MODAL
========================================================= */

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

    modal.style.display =
        "flex";

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

    modal.style.display =
        "";

    showMessage(
        "loginMessage",
        ""
    );
}


/* =========================================================
   11. LOGIN ADMIN
========================================================= */

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

            throw error;
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


/* =========================================================
   12. LOGOUT
========================================================= */

async function logoutAdmin() {

    try {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            throw error;
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
            "LOGOUT ERROR:",
            error
        );

        alert(
            "Gagal logout: " +
            error.message
        );
    }
}


/* =========================================================
   13. CHECK LOGIN
========================================================= */

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


/* =========================================================
   14. ADMIN UI
========================================================= */

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


/* =========================================================
   15. AUTH STATE
========================================================= */

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


/* =========================================================
   16. OPEN ADD ALBUM MODAL
========================================================= */

function openAddAlbumModal() {

    if (!currentUser) {

        openLoginModal();

        return;
    }


    const modal =
        document.getElementById(
            "addAlbumModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );

    modal.style.display =
        "flex";
}


/* =========================================================
   17. CLOSE ADD ALBUM MODAL
========================================================= */

function closeAddAlbumModal() {

    const modal =
        document.getElementById(
            "addAlbumModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.style.display =
        "";


    const form =
        document.getElementById(
            "albumForm"
        );


    if (form) {

        form.reset();
    }


    const preview =
        document.getElementById(
            "photoPreview"
        ) ||
        document.getElementById(
            "previewFoto"
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


/* =========================================================
   18. PREVIEW FOTO
========================================================= */

function previewPhoto(event) {

    const input =
        event?.target ||
        document.getElementById(
            "foto"
        );


    if (!input) {
        return;
    }


    const preview =
        document.getElementById(
            "photoPreview"
        ) ||
        document.getElementById(
            "previewFoto"
        );


    if (!preview) {
        return;
    }


    preview.innerHTML =
        "";


    const files =
        Array.from(
            input.files || []
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
                function(e) {

                    const wrapper =
                        document.createElement(
                            "div"
                        );

                    wrapper.className =
                        "photo-preview-item";


                    wrapper.innerHTML = `
                        <div class="preview-image-wrapper">

                            <img
                                src="${e.target.result}"
                                alt="Preview foto"
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

                        </div>
                    `;


                    preview.appendChild(
                        wrapper
                    );
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   19. UPLOAD FOTO KE STORAGE
========================================================= */

async function uploadFoto(
    file,
    albumId
) {

    if (!file) {

        throw new Error(
            "File foto tidak ditemukan."
        );
    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        throw new Error(
            file.name +
            " bukan file gambar."
        );
    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            file.name +
            " lebih besar dari 10 MB."
        );
    }


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    const randomName =
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 10);


    const fileName =
        randomName +
        "." +
        extension;


    const filePath =
        "albums/" +
        albumId +
        "/" +
        fileName;


    const {
        data,
        error
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


    if (error) {

        console.error(
            "STORAGE UPLOAD ERROR:",
            error
        );

        throw error;
    }


    const {
        data: publicData
    } =
        supabaseClient
            .storage
            .from(
                STORAGE_BUCKET
            )
            .getPublicUrl(
                data.path
            );


    if (
        !publicData ||
        !publicData.publicUrl
    ) {

        throw new Error(
            "URL foto gagal dibuat."
        );
    }


    return {
        url:
            publicData.publicUrl,

        path:
            data.path
    };
}


/* =========================================================
   20. EXTRACT STORAGE PATH
========================================================= */

function extractStoragePath(
    publicUrl
) {

    if (!publicUrl) {
        return null;
    }


    const marker =
        "/storage/v1/object/public/" +
        STORAGE_BUCKET +
        "/";


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
}


/* =========================================================
   21. TAMBAH ALBUM
========================================================= */

async function tambahAlbum(event) {

    if (event) {
        event.preventDefault();
    }


    if (!currentUser) {

        alert(
            "Silakan login sebagai admin terlebih dahulu."
        );

        openLoginModal();

        return;
    }


    const judulInput =
        document.getElementById(
            "judul"
        );

    const tanggalInput =
        document.getElementById(
            "tanggal"
        );

    const lokasiInput =
        document.getElementById(
            "lokasi"
        );

    const ceritaInput =
        document.getElementById(
            "cerita"
        );

    const fileInput =
        document.getElementById(
            "foto"
        );


    if (
        !judulInput ||
        !tanggalInput ||
        !lokasiInput ||
        !ceritaInput ||
        !fileInput
    ) {

        alert(
            "Form album tidak lengkap. Periksa ID HTML."
        );

        return;
    }


    const title =
        judulInput.value.trim();

    const tanggal =
        tanggalInput.value;

    const lokasi =
        lokasiInput.value.trim();

    const cerita =
        ceritaInput.value.trim();

    const files =
        Array.from(
            fileInput.files || []
        );


    /* -----------------------------------------------------
       VALIDASI
    ----------------------------------------------------- */

    if (!title) {

        alert(
            "Judul album belum diisi."
        );

        judulInput.focus();

        return;
    }


    if (!tanggal) {

        alert(
            "Tanggal album belum diisi."
        );

        tanggalInput.focus();

        return;
    }


    if (!files.length) {

        alert(
            "Pilih minimal satu foto."
        );

        fileInput.click();

        return;
    }


    const button =
        document.getElementById(
            "btnBuatAlbum"
        ) ||
        document.querySelector(
            ".btn-submit"
        );


    const oldButtonText =
        button
            ? button.innerHTML
            : "";


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            "⏳ Membuat Album...";
    }


    let albumId =
        null;

    const uploadedFiles =
        [];


    try {

        /* -------------------------------------------------
           STEP 1
           INSERT ALBUM

           HANYA:
           title
           tanggal
           lokasi
           cerita
           cover_url
        ------------------------------------------------- */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from("albums")
                .insert([
                    {
                        title:
                            title,

                        tanggal:
                            tanggal,

                        lokasi:
                            lokasi ||
                            null,

                        cerita:
                            cerita ||
                            null,

                        cover_url:
                            null
                    }
                ])
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url"
                )
                .single();


        if (albumError) {

            throw albumError;
        }


        if (
            !album ||
            !album.id
        ) {

            throw new Error(
                "Album berhasil dibuat tetapi ID tidak ditemukan."
            );
        }


        albumId =
            album.id;


        /* -------------------------------------------------
           STEP 2
           UPLOAD SEMUA FOTO
        ------------------------------------------------- */

        const photoRows =
            [];


        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            if (button) {

                button.innerHTML =
                    `⏳ Upload foto ${i + 1} dari ${files.length}...`;
            }


            const uploaded =
                await uploadFoto(
                    file,
                    albumId
                );


            uploadedFiles.push(
                uploaded
            );


            /* ---------------------------------------------
               DATABASE:

               HANYA:
               album_id
               foto_url

               TIDAK ADA:
               foto_path
            --------------------------------------------- */

            photoRows.push({
                album_id:
                    albumId,

                foto_url:
                    uploaded.url
            });
        }


        /* -------------------------------------------------
           STEP 3
           INSERT FOTO
        ------------------------------------------------- */

        if (
            photoRows.length
        ) {

            const {
                error:
                    photoError
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .insert(
                        photoRows
                    );


            if (photoError) {

                throw photoError;
            }
        }


        /* -------------------------------------------------
           STEP 4
           FOTO PERTAMA = COVER
        ------------------------------------------------- */

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
                                .foto_url
                    })
                    .eq(
                        "id",
                        albumId
                    );


            if (coverError) {

                throw coverError;
            }
        }


        /* -------------------------------------------------
           STEP 5
           BERHASIL
        ------------------------------------------------- */

        alert(
            "Album berhasil dibuat ❤️"
        );


        /* -------------------------------------------------
           RESET
        ------------------------------------------------- */

        const form =
            document.getElementById(
                "albumForm"
            );


        if (form) {
            form.reset();
        }


        const preview =
            document.getElementById(
                "photoPreview"
            ) ||
            document.getElementById(
                "previewFoto"
            );


        if (preview) {

            preview.innerHTML =
                "";
        }


        /* -------------------------------------------------
           TUTUP MODAL
        ------------------------------------------------- */

        closeAddAlbumModal();


        /* -------------------------------------------------
           REFRESH
        ------------------------------------------------- */

        await loadAlbums();


    } catch (error) {

        console.error(
            "TAMBAH ALBUM ERROR:",
            error
        );


        /* -------------------------------------------------
           HAPUS DATA ALBUM JIKA GAGAL
        ------------------------------------------------- */

        if (albumId) {

            try {

                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .delete()
                    .eq(
                        "album_id",
                        albumId
                    );


                await supabaseClient
                    .from(
                        "albums"
                    )
                    .delete()
                    .eq(
                        "id",
                        albumId
                    );

            } catch (
                rollbackError
            ) {

                console.error(
                    "ROLLBACK ERROR:",
                    rollbackError
                );
            }
        }


        /* -------------------------------------------------
           HAPUS STORAGE
        ------------------------------------------------- */

        if (
            uploadedFiles.length
        ) {

            try {

                const paths =
                    uploadedFiles.map(
                        item =>
                            item.path
                    );


                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
                    );

            } catch (
                storageError
            ) {

                console.error(
                    "STORAGE CLEANUP ERROR:",
                    storageError
                );
            }
        }


        alert(
            "Gagal membuat album:\n\n" +
            error.message
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                oldButtonText ||
                "Buat Album ❤️";
        }
    }
}


/* =========================================================
   22. LOAD ALBUM
========================================================= */

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
            PENTING:

            Database kita menggunakan:

            tanggal

            BUKAN:

            date
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "albums"
                )
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url,created_at"
                )
                .order(
                    "tanggal",
                    {
                        ascending:
                            true
                    }
                );


        if (error) {

            throw error;
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

                <button
                    onclick="loadAlbums()"
                >
                    Coba Lagi
                </button>

            </div>
        `;
    }
}


/* =========================================================
   23. GET FOTO ALBUM
========================================================= */

async function getAlbumPhotos(
    albumId
) {

    if (!albumId) {
        return [];
    }


    try {

        /*
            PENTING:

            HANYA:
            id
            album_id
            foto_url
            created_at

            TIDAK:
            foto_path
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
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
                        ascending:
                            true
                    }
                );


        if (error) {

            throw error;
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


/* =========================================================
   24. RENDER TIMELINE
========================================================= */

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


    list.innerHTML =
        "";


    for (
        const album
        of albums
    ) {

        const photos =
            await getAlbumPhotos(
                album.id
            );


        const cover =
            album.cover_url ||
            (
                photos.length
                ? photos[0].foto_url
                : ""
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "timeline-item";


        card.innerHTML = `
            <div class="timeline-dot"></div>

            <div class="timeline-card">

                <div class="timeline-cover-wrapper">

                    ${
                        cover
                        ?
                        `
                        <img
                            class="timeline-cover"
                            src="${escapeHTML(
                                cover
                            )}"
                            alt="${escapeHTML(
                                album.title
                            )}"
                            loading="lazy"
                        >
                        `
                        :
                        `
                        <div class="timeline-cover-empty">
                            ❤️
                        </div>
                        `
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
                            album.title
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
            card
        );
    }
}


/* =========================================================
   25. OPEN ALBUM
========================================================= */

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


    if (
        !viewer ||
        !content
    ) {

        console.error(
            "albumViewer atau albumViewerContent tidak ditemukan."
        );

        return;
    }


    viewer.classList.remove(
        "hidden"
    );

    viewer.style.display =
        "flex";


    content.innerHTML = `
        <div class="loading">
            ❤️ Membuka album...
        </div>
    `;


    try {

        /* -------------------------------------------------
           AMBIL ALBUM
        ------------------------------------------------- */

        const {
            data: album,
            error: albumError
        } =
            await supabaseClient
                .from(
                    "albums"
                )
                .select(
                    "id,title,tanggal,lokasi,cerita,cover_url"
                )
                .eq(
                    "id",
                    albumId
                )
                .single();


        if (albumError) {

            throw albumError;
        }


        /* -------------------------------------------------
           AMBIL FOTO
        ------------------------------------------------- */

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


/* =========================================================
   26. RENDER ALBUM VIEWER
========================================================= */

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


    content.innerHTML = `

        <div class="album-viewer-header">

            <div class="album-viewer-date">
                ${formatTanggal(
                    album.tanggal
                )}
            </div>


            <h2>
                ${escapeHTML(
                    album.title
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
                Foto Kenangan ❤️
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
                photos.length
                ?
                photos
                    .map(
                        (photo, index) => `

                            <div
                                class="album-photo-item"
                            >

                                <img
                                    src="${escapeHTML(
                                        photo.foto_url
                                    )}"
                                    alt="Foto kenangan ${index + 1}"
                                    loading="lazy"
                                    onclick="previewPhotoViewer('${escapeHTML(
                                        photo.foto_url
                                    )}')"
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


/* =========================================================
   27. CLOSE ALBUM VIEWER
========================================================= */

function closeAlbumViewer() {

    const viewer =
        document.getElementById(
            "albumViewer"
        );


    if (!viewer) {
        return;
    }


    viewer.classList.add(
        "hidden"
    );

    viewer.style.display =
        "";


    currentAlbum =
        null;

    albumPhotosCache =
        [];
}


/* =========================================================
   28. PREVIEW FOTO BESAR
========================================================= */

function previewPhotoViewer(
    url
) {

    if (!url) {
        return;
    }


    let viewer =
        document.getElementById(
            "photoPreviewViewer"
        );


    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "photoPreviewViewer";


        viewer.className =
            "photo-preview-viewer";


        viewer.innerHTML = `
            <button
                type="button"
                class="photo-preview-close"
                onclick="closePhotoPreview()"
            >
                ×
            </button>

            <img
                id="photoPreviewViewerImage"
                src=""
                alt="Foto"
            >
        `;


        document.body.appendChild(
            viewer
        );
    }


    const image =
        document.getElementById(
            "photoPreviewViewerImage"
        );


    if (image) {

        image.src =
            url;
    }


    viewer.classList.add(
        "active"
    );
}


function closePhotoPreview() {

    const viewer =
        document.getElementById(
            "photoPreviewViewer"
        );


    if (!viewer) {
        return;
    }


    viewer.classList.remove(
        "active"
    );
}


window.previewPhotoViewer =
    previewPhotoViewer;


window.closePhotoPreview =
    closePhotoPreview;


/* =========================================================
   29. TRIGGER TAMBAH FOTO
========================================================= */

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

        input.click();
    }
}


/* =========================================================
   30. TAMBAH FOTO KE ALBUM LAMA
========================================================= */

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


    const input =
        event?.target;


    if (!input) {
        return;
    }


    const files =
        Array.from(
            input.files || []
        );


    if (!files.length) {
        return;
    }


    const uploadedPaths =
        [];


    try {

        for (
            let i = 0;
            i < files.length;
            i++
        ) {

            const file =
                files[i];


            const uploaded =
                await uploadFoto(
                    file,
                    currentAlbum.id
                );


            uploadedPaths.push(
                uploaded.path
            );


            /*
                HANYA:
                album_id
                foto_url
            */

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .insert([
                        {
                            album_id:
                                currentAlbum.id,

                            foto_url:
                                uploaded.url
                        }
                    ]);


            if (error) {

                throw error;
            }


            /*
                Jika album belum punya cover,
                foto pertama menjadi cover.
            */

            if (
                !currentAlbum.cover_url
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
                                uploaded.url
                        })
                        .eq(
                            "id",
                            currentAlbum.id
                        );


                if (coverError) {

                    throw coverError;
                }


                currentAlbum.cover_url =
                    uploaded.url;
            }
        }


        input.value =
            "";


        alert(
            `${files.length} foto berhasil ditambahkan ❤️`
        );


        await openAlbum(
            currentAlbum.id
        );


        await loadAlbums();


    } catch (error) {

        console.error(
            "ADD PHOTO ERROR:",
            error
        );


        /*
            Cleanup storage
            jika upload berhasil
            tetapi database gagal.
        */

        if (
            uploadedPaths.length
        ) {

            try {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        uploadedPaths
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


        alert(
            "Gagal menambahkan foto:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   31. HAPUS FOTO
========================================================= */

async function hapusFotoAlbum(
    photoId,
    photoUrl
) {

    if (!currentUser) {

        alert(
            "Silakan login sebagai admin."
        );

        return;
    }


    if (!photoId) {
        return;
    }


    const yakin =
        confirm(
            "Yakin ingin menghapus foto ini?"
        );


    if (!yakin) {
        return;
    }


    try {

        /*
            Ambil foto berdasarkan ID
            supaya URL benar-benar
            berasal dari database.
        */

        const {
            data: photo,
            error:
                findError
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

            throw findError;
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

            throw deleteError;
        }


        /*
            Hapus Storage
        */

        const storagePath =
            extractStoragePath(
                photo.foto_url
            );


        if (storagePath) {

            await supabaseClient
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .remove([
                    storagePath
                ]);
        }


        /*
            Jika foto yang dihapus
            adalah cover, cari foto lain.
        */

        const {
            data: album
        } =
            await supabaseClient
                .from(
                    "albums"
                )
                .select(
                    "id,cover_url"
                )
                .eq(
                    "id",
                    photo.album_id
                )
                .single();


        if (
            album &&
            album.cover_url ===
                photo.foto_url
        ) {

            const {
                data: remainingPhotos
            } =
                await supabaseClient
                    .from(
                        "album_photos"
                    )
                    .select(
                        "foto_url"
                    )
                    .eq(
                        "album_id",
                        photo.album_id
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                true
                        }
                    );


            const newCover =
                remainingPhotos?.length
                ?
                remainingPhotos[0]
                    .foto_url
                :
                null;


            await supabaseClient
                .from(
                    "albums"
                )
                .update({
                    cover_url:
                        newCover
                })
                .eq(
                    "id",
                    photo.album_id
                );
        }


        alert(
            "Foto berhasil dihapus ❤️"
        );


        if (
            currentAlbum &&
            currentAlbum.id ===
                photo.album_id
        ) {

            await openAlbum(
                photo.album_id
            );
        }


        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );


        alert(
            "Gagal menghapus foto:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   32. HAPUS ALBUM
========================================================= */

async function hapusAlbum(
    albumId
) {

    if (!currentUser) {

        alert(
            "Silakan login sebagai admin."
        );

        return;
    }


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

        /*
            AMBIL FOTO
        */

        const {
            data: photos,
            error:
                photosError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .select(
                    "foto_url"
                )
                .eq(
                    "album_id",
                    albumId
                );


        if (photosError) {

            throw photosError;
        }


        /*
            HAPUS STORAGE
        */

        if (
            photos &&
            photos.length
        ) {

            const paths =
                photos
                    .map(
                        photo =>
                            extractStoragePath(
                                photo.foto_url
                            )
                    )
                    .filter(
                        path =>
                            path
                    );


            if (paths.length) {

                await supabaseClient
                    .storage
                    .from(
                        STORAGE_BUCKET
                    )
                    .remove(
                        paths
                    );
            }
        }


        /*
            HAPUS FOTO DATABASE
        */

        const {
            error:
                photoDeleteError
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


        if (photoDeleteError) {

            throw photoDeleteError;
        }


        /*
            HAPUS ALBUM
        */

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


        if (albumDeleteError) {

            throw albumDeleteError;
        }


        closeAlbumViewer();


        alert(
            "Album berhasil dihapus ❤️"
        );


        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE ALBUM ERROR:",
            error
        );


        alert(
            "Gagal menghapus album:\n\n" +
            error.message
        );
    }
}


/* =========================================================
   33. SCROLL GALERI
========================================================= */

function scrollToGallery() {

    const timeline =
        document.getElementById(
            "timelineList"
        );


    if (!timeline) {
        return;
    }


    timeline.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });
}


/* =========================================================
   34. PLAYLIST
========================================================= */

function openPlaylist(event) {

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

    modal.style.display =
        "flex";
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

    modal.style.display =
        "";
}


/* =========================================================
   35. BACKDROP CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
            Tutup photo viewer
            jika klik area luar gambar.
        */

        const viewer =
            document.getElementById(
                "photoPreviewViewer"
            );


        if (
            viewer &&
            viewer.classList.contains(
                "active"
            ) &&
            event.target === viewer
        ) {

            closePhotoPreview();
        }
    }
);


/* =========================================================
   36. ESCAPE KEY
========================================================= */

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

        closePhotoPreview();

        closePlaylist();
    }
);


/* =========================================================
   37. OLD HTML COMPATIBILITY
========================================================= */

function tambahKenangan(
    event
) {

    return tambahAlbum(
        event
    );
}


function openAddForm() {

    openAddAlbumModal();
}


function closeAddForm() {

    closeAddAlbumModal();
}


function closeAlbum() {

    closeAlbumViewer();
}


/* =========================================================
   38. GLOBAL FUNCTIONS
========================================================= */

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

window.openAddForm =
    openAddForm;

window.closeAddForm =
    closeAddForm;

window.tambahAlbum =
    tambahAlbum;

window.tambahKenangan =
    tambahKenangan;

window.previewPhoto =
    previewPhoto;

window.openAlbum =
    openAlbum;

window.closeAlbumViewer =
    closeAlbumViewer;

window.closeAlbum =
    closeAlbum;

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

window.scrollToGallery =
    scrollToGallery;

window.loadAlbums =
    loadAlbums;


/* =========================================================
   39. INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /*
                Pastikan Supabase tersedia
            */

            if (
                !window.supabase
            ) {

                console.error(
                    "Supabase JS belum dimuat."
                );

                return;
            }


            /*
                CHECK LOGIN
            */

            await checkLogin();


            /*
                LOAD ALBUM
            */

            await loadAlbums();


            /*
                FILE INPUT PREVIEW
            */

            const fileInput =
                document.getElementById(
                    "foto"
                );


            if (fileInput) {

                fileInput.addEventListener(
                    "change",
                    previewPhoto
                );
            }


            /*
                TOMBOL ENTER PADA LOGIN
            */

            const loginForm =
                document.getElementById(
                    "loginForm"
                );


            if (loginForm) {

                loginForm.addEventListener(
                    "submit",
                    loginAdmin
                );
            }


        } catch (error) {

            console.error(
                "INITIALIZATION ERROR:",
                error
            );
        }
    }
);


/* =========================================================
   SELESAI
========================================================= */