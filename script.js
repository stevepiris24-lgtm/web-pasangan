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


/*
    NAMA BUCKET STORAGE SUPABASE

    Pastikan nama bucket di Supabase sama persis:
    ALBUM-PHOTOS
*/

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
   5. CHANGE HERO TEXT
===================================================== */

function changeHeroText() {

    const element =
        document.getElementById(
            "heroTitle"
        );


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
            heroTexts[
                heroTextIndex
            ];


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

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =====================================================
   7. FORMAT TANGGAL
===================================================== */

function formatTanggal(
    dateValue
) {

    if (!dateValue) {

        return "-";

    }


    /*
        Jika input berupa YYYY-MM-DD,
        kita pecah manual supaya tidak
        terkena masalah timezone.
    */

    const value =
        String(dateValue);


    const match =
        value.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );


    if (match) {

        const year =
            Number(match[1]);

        const month =
            Number(match[2]);

        const day =
            Number(match[3]);


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
   8. SHOW MESSAGE
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

    /*
        Tanggal mulai:
        24 April 2024
    */

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
   11. LOGIN ADMIN
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
   13. CHECK LOGIN SESSION
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
   15. SUPABASE AUTH STATE LISTENER
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
   16. LOAD ALBUMS
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

        const {
            data,
            error
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
   17. GET ALBUM PHOTOS
===================================================== */

async function getAlbumPhotos(
    albumId
) {

    /*
        PENTING:

        album_id kemungkinan UUID.

        Jangan gunakan:
        Number(albumId)
    */


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
        Render satu per satu
    */

    for (
        const album
        of albums
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
}


/* =====================================================
   19. OPEN ALBUM
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


    if (
        !viewer ||
        !content
    ) {

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

            console.error(
                "OPEN ALBUM ERROR:",
                albumError
            );


            content.innerHTML =
                `
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


        content.innerHTML =
            `
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
        album.judul ||
        "Tanpa Judul";


    content.innerHTML =
        `
        <div class="album-viewer-header">

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
                photos.length > 0
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
                    `
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
   21. CLOSE ALBUM VIEWER
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
   22. PREVIEW PHOTO
===================================================== */

function previewPhoto(
    url
) {

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


    win.document.write(
        `
        <!DOCTYPE html>

        <html>

        <head>

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
                src="${escapeHTML(
                    url
                )}"
                alt="Foto"
            >

        </body>

        </html>
        `
    );


    win.document.close();
}


/* =====================================================
   23. ADD ALBUM MODAL
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
   24. CLOSE ADD ALBUM MODAL
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

        preview.innerHTML =
            "";

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


    const title =
        titleInput
            ?.value
            .trim() || "";


    const tanggal =
        dateInput
            ?.value || "";


    const lokasi =
        locationInput
            ?.value
            .trim() || "";


    const cerita =
        storyInput
            ?.value
            .trim() || "";


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


        return;
    }


    if (!tanggal) {

        showMessage(
            "albumMessage",
            "Tanggal album wajib diisi."
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


    let createdAlbum = null;


    try {

        /* =================================================
           STEP 1
           INSERT ALBUM

           PENTING:

           TIDAK ADA:
           cover_path

           karena kolom tersebut tidak diperlukan.
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

                    /*
                        judul tetap dikirim
                        untuk kompatibilitas
                        dengan database lama.
                    */

                    judul:
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

           Tidak ada cover_path.
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
            Kalau album sudah dibuat
            tetapi upload foto gagal,
            kita hapus album tersebut
            agar tidak ada album kosong
            akibat upload gagal.
        */

        if (
            createdAlbum?.id
        ) {

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
                    "CLEANUP ALBUM ERROR:",
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
   27. UPLOAD ALBUM PHOTOS
===================================================== */

async function uploadAlbumPhotos(
    albumId,
    files
) {

    /*
        photoRows HANYA berisi kolom
        yang memang ada di album_photos.

        Struktur:

        album_id
        foto_url

        TIDAK ADA:
        foto_path
    */

    const photoRows = [];


    /*
        Digunakan hanya untuk cleanup
        Storage jika INSERT database gagal.

        Ini BUKAN dikirim ke database.
    */

    const uploadedStoragePaths = [];


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


        /* ---------------------------------------------
           BATASI UKURAN FILE
        --------------------------------------------- */

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


        /* ---------------------------------------------
           NAMA FILE
        --------------------------------------------- */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


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
            safeName;


        /*
            Struktur Storage:

            ALBUM-PHOTOS/
                UUID-ALBUM/
                    foto.jpg
        */

        const filePath =
            String(albumId) +
            "/" +
            fileName;


        /* ---------------------------------------------
           UPLOAD STORAGE
        --------------------------------------------- */

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
                Hapus file yang sudah
                terupload sebelum error.
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


        const uploadedPath =
            uploadData.path;


        uploadedStoragePaths.push(
            uploadedPath
        );


        /* ---------------------------------------------
           GET PUBLIC URL
        --------------------------------------------- */

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
            publicUrlData.publicUrl;


        /* ---------------------------------------------
           PHOTO DATABASE ROW

           HANYA:
           album_id
           foto_url
        --------------------------------------------- */

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
                Karena foto_path tidak
                disimpan di database,
                kita masih memiliki path
                di memory untuk cleanup.
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
   28. TRIGGER ADD PHOTOS
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
   29. ADD PHOTOS TO CURRENT ALBUM
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


        /*
            Tambahkan ke cache
        */

        albumPhotosCache =
            [
                ...albumPhotosCache,
                ...newPhotos
            ];


        /*
            Jika album belum mempunyai cover,
            foto pertama menjadi cover.
        */

        if (
            !currentAlbum.cover_url &&
            newPhotos.length > 0
        ) {

            const newCover =
                newPhotos[0].foto_url;


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

                console.error(
                    "UPDATE COVER ERROR:",
                    coverError
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

        if (event?.target) {

            event.target.value =
                "";

        }
    }
}


/* =====================================================
   30. EXTRACT STORAGE PATH FROM PUBLIC URL
===================================================== */

function getStoragePathFromPublicUrl(
    url
) {

    if (!url) {

        return null;

    }


    try {

        /*
            Contoh URL:

            https://xxxxx.supabase.co/storage/v1/object/public/ALBUM-PHOTOS/UUID/foto.jpg

            Kita cari bagian:

            /storage/v1/object/public/ALBUM-PHOTOS/
        */

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const index =
            url.indexOf(
                marker
            );


        if (
            index === -1
        ) {

            return null;

        }


        return decodeURIComponent(
            url.substring(
                index +
                marker.length
            )
        );


    } catch (error) {

        console.error(
            "GET STORAGE PATH ERROR:",
            error
        );


        return null;

    }
}


/* =====================================================
   31. DELETE PHOTO
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

        /* ---------------------------------------------
           DELETE DATABASE
        --------------------------------------------- */

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


        /* ---------------------------------------------
           DELETE STORAGE

           Path didapat dari URL.
        --------------------------------------------- */

        const storagePath =
            getStoragePathFromPublicUrl(
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


        /* ---------------------------------------------
           REFRESH ALBUM
        --------------------------------------------- */

        if (
            currentAlbum?.id
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
   32. DELETE ALBUM
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

        /* ---------------------------------------------
           AMBIL SEMUA FOTO ALBUM
        --------------------------------------------- */

        const photos =
            await getAlbumPhotos(
                albumId
            );


        /* ---------------------------------------------
           AMBIL STORAGE PATH DARI URL
        --------------------------------------------- */

        const paths =
            photos
                .map(
                    photo =>
                        getStoragePathFromPublicUrl(
                            photo.foto_url
                        )
                )
                .filter(
                    Boolean
                );


        /* ---------------------------------------------
           HAPUS STORAGE
        --------------------------------------------- */

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
                    "STORAGE DELETE WARNING:",
                    storageError
                );

            }
        }


        /* ---------------------------------------------
           HAPUS FOTO DATABASE
        --------------------------------------------- */

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


        /* ---------------------------------------------
           HAPUS ALBUM
        --------------------------------------------- */

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


        /* ---------------------------------------------
           CLOSE VIEWER JIKA TERBUKA
        --------------------------------------------- */

        if (
            currentAlbum?.id ===
            albumId
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
   33. PLAYLIST
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
   34. CLOSE MODAL WITH ESCAPE
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
   35. COMPATIBILITY WITH OLD HTML
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

        /*
            Pastikan Supabase sudah
            dikonfigurasi.
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

                list.innerHTML =
                    `
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
            Cek login
        */

        await checkLogin();


        /*
            Load album
        */

        await loadAlbums();

    }
);