/* =========================================================
   UNTUK LILA
   SUPABASE + ALBUM + TIMELINE
   ========================================================= */


/* =========================================================
   1. SUPABASE CONFIGURATION
   =========================================================

   GANTI:
   SUPABASE_URL
   SUPABASE_PUBLISHABLE_KEY

   Ambil dari:

   Supabase
   >
   Project Settings
   >
   API

   Gunakan Publishable Key / anon key.
   ========================================================= */

const SUPABASE_URL =
    "https://zfuufjwkgttrywcfmwsn.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_ozpU_wRFramJNDT5q-oIgw_BY_Iceub";


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_BUCKET =
    "ALBUM-PHOTOS";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let albums = [];

let currentAlbum = null;


/* =========================================================
   TEXT BERGANTI
   ========================================================= */

const changingMessages = [

    "Setiap hari bersamamu adalah rumah.",

    "Bersamamu, semua terasa cukup.",

    "Terima kasih sudah menjadi bagian dari cerita ini.",

    "Semoga cerita kita selalu punya halaman berikutnya.",

    "Dari banyaknya manusia, aku tetap memilih kamu.",

    "Tidak harus sempurna, cukup kita.",

    "Semoga kita selalu menemukan jalan untuk pulang.",

    "Aku ingin menyimpan lebih banyak cerita bersamamu.",

    "Kamu adalah bagian favorit dari perjalanan ini."

];


let currentMessageIndex = 0;


/* =========================================================
   QUOTES
   ========================================================= */

const quotes = [

    "Setiap hari bersamamu adalah rumah.",

    "Kalau boleh memilih lagi, aku tetap memilih kita.",

    "Cerita terbaik adalah cerita yang masih terus berjalan.",

    "Tidak perlu sempurna untuk menjadi berarti.",

    "Semoga kita selalu punya alasan untuk tersenyum bersama.",

    "Satu hari, satu cerita, satu kenangan.",

    "Kita mungkin sederhana, tapi cerita kita tidak pernah biasa."

];


let currentQuoteIndex = 0;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setDefaultDate();

        updateDaysTogether();

        updateHoursTogether();

        startChangingText();

        startChangingQuotes();

        await checkAuth();

        await loadAlbums();

    }
);


/* =========================================================
   DEFAULT DATE
   ========================================================= */

function setDefaultDate() {

    const dateInput =
        document.getElementById("albumDate");


    if (!dateInput) {
        return;
    }


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


/* =========================================================
   HITUNG HARI BERSAMA
   ========================================================= */

function updateDaysTogether() {

    const startDate =
        new Date(
            "2024-04-24T00:00:00"
        );


    const now =
        new Date();


    const difference =
        now.getTime() -
        startDate.getTime();


    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );


    const element =
        document.getElementById(
            "daysTogether"
        );


    if (element) {

        element.textContent =
            Math.max(days, 0).toLocaleString(
                "id-ID"
            );

    }

}


/* =========================================================
   HITUNG JAM BERSAMA
   ========================================================= */

function updateHoursTogether() {

    const startDate =
        new Date(
            "2024-04-24T00:00:00"
        );


    const now =
        new Date();


    const difference =
        now.getTime() -
        startDate.getTime();


    const hours =
        Math.floor(
            difference /
            (1000 * 60 * 60)
        );


    const element =
        document.getElementById(
            "hoursTogether"
        );


    if (element) {

        element.textContent =
            `${hours.toLocaleString("id-ID")} jam bersama ⏳`;

    }

}


/* =========================================================
   TEXT ROTATION
   ========================================================= */

function startChangingText() {

    const element =
        document.getElementById(
            "changingText"
        );


    if (!element) {
        return;
    }


    setInterval(
        function () {

            element.classList.add(
                "fade-out"
            );


            setTimeout(
                function () {

                    currentMessageIndex++;

                    if (
                        currentMessageIndex >=
                        changingMessages.length
                    ) {

                        currentMessageIndex = 0;

                    }


                    element.textContent =
                        changingMessages[
                            currentMessageIndex
                        ];


                    element.classList.remove(
                        "fade-out"
                    );

                },
                400
            );

        },
        5000
    );

}


/* =========================================================
   QUOTE ROTATION
   ========================================================= */

function startChangingQuotes() {

    const element =
        document.getElementById(
            "quoteText"
        );


    if (!element) {
        return;
    }


    setInterval(
        function () {

            currentQuoteIndex++;


            if (
                currentQuoteIndex >=
                quotes.length
            ) {

                currentQuoteIndex = 0;

            }


            element.style.opacity = "0";


            setTimeout(
                function () {

                    element.textContent =
                        quotes[
                            currentQuoteIndex
                        ];

                    element.style.opacity = "1";

                },
                250
            );

        },
        6000
    );

}


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
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(
            `${dateValue}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateValue;

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
   CHECK AUTH
   ========================================================= */

async function checkAuth() {

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
                "Auth error:",
                error
            );

            updateAdminUI(null);

            return;

        }


        updateAdminUI(
            data.session
        );


    } catch (error) {

        console.error(
            "Gagal mengecek login:",
            error
        );

        updateAdminUI(null);

    }

}


/* =========================================================
   AUTH STATE CHANGE
   ========================================================= */

supabaseClient
    .auth
    .onAuthStateChange(
        function (
            event,
            session
        ) {

            updateAdminUI(
                session
            );

        }
    );


/* =========================================================
   UPDATE ADMIN UI
   ========================================================= */

function updateAdminUI(session) {

    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const addAlbumButton =
        document.getElementById(
            "addAlbumButton"
        );


    if (session) {

        loginButton?.classList.add(
            "hidden"
        );


        logoutButton?.classList.remove(
            "hidden"
        );


        addAlbumButton?.classList.remove(
            "hidden"
        );

    } else {

        loginButton?.classList.remove(
            "hidden"
        );


        logoutButton?.classList.add(
            "hidden"
        );


        addAlbumButton?.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginAdmin() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const message =
        document.getElementById(
            "loginMessage"
        );


    const button =
        document.getElementById(
            "loginSubmitButton"
        );


    message.textContent =
        "Sedang login...";


    button.disabled =
        true;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword(
                    {
                        email,
                        password
                    }
                );


        if (error) {
            throw error;
        }


        message.textContent =
            "Login berhasil ❤️";


        setTimeout(
            function () {

                closeLoginModal();

            },
            500
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        message.textContent =
            "Login gagal: " +
            error.message;


    } finally {

        button.disabled =
            false;

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutAdmin() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();


    if (error) {

        alert(
            "Gagal logout: " +
            error.message
        );

        return;

    }


    alert(
        "Berhasil logout."
    );

}


/* =========================================================
   LOGIN MODAL
   ========================================================= */

function openLoginModal() {

    document
        .getElementById(
            "loginModal"
        )
        .classList.remove(
            "hidden"
        );

}


function closeLoginModal() {

    document
        .getElementById(
            "loginModal"
        )
        .classList.add(
            "hidden"
        );

}


/* =========================================================
   OPEN ALBUM FORM
   ========================================================= */

async function openAlbumForm() {

    const {
        data
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!data.session) {

        openLoginModal();

        return;

    }


    document
        .getElementById(
            "albumModal"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "albumFormMessage"
        )
        .textContent = "";

}


/* =========================================================
   CLOSE ALBUM FORM
   ========================================================= */

function closeAlbumForm() {

    document
        .getElementById(
            "albumModal"
        )
        .classList.add(
            "hidden"
        );

}


/* =========================================================
   CREATE ALBUM
   ========================================================= */

async function createAlbum() {

    const title =
        document
            .getElementById(
                "albumTitle"
            )
            .value
            .trim();


    const tanggal =
        document
            .getElementById(
                "albumDate"
            )
            .value;


    const lokasi =
        document
            .getElementById(
                "albumLocation"
            )
            .value
            .trim();


    const cerita =
        document
            .getElementById(
                "albumStory"
            )
            .value
            .trim();


    const filesInput =
        document
            .getElementById(
                "albumPhotos"
            );


    const files =
        Array.from(
            filesInput.files
        );


    const message =
        document.getElementById(
            "albumFormMessage"
        );


    const button =
        document.getElementById(
            "saveAlbumButton"
        );


    /* =====================================================
       VALIDASI
       ===================================================== */

    if (!title) {

        message.textContent =
            "Nama album wajib diisi.";

        return;

    }


    if (!tanggal) {

        message.textContent =
            "Tanggal wajib diisi.";

        return;

    }


    /* =====================================================
       LOGIN CHECK
       ===================================================== */

    const {
        data: authData
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!authData.session) {

        message.textContent =
            "Silakan login sebagai admin.";

        return;

    }


    button.disabled =
        true;


    button.textContent =
        "Membuat album...";


    message.textContent =
        "Menyimpan album...";


    let createdAlbum =
        null;


    try {

        /* =================================================
           INSERT ALBUM

           PENTING:

           Database memakai:
           title

           BUKAN:
           judul

           ================================================= */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("albums")
                .insert({

                    title: title,

                    tanggal: tanggal,

                    lokasi: lokasi,

                    cerita: cerita

                })
                .select("*")
                .single();


        if (error) {

            throw error;

        }


        createdAlbum =
            data;


        /* =================================================
           UPLOAD FOTO JIKA ADA
           ================================================= */

        if (files.length > 0) {

            message.textContent =
                `Album berhasil dibuat. Mengupload ${files.length} foto...`;


            await uploadPhotosToAlbum(
                createdAlbum.id,
                files
            );

        }


        message.textContent =
            "Album berhasil dibuat ❤️";


        /* =================================================
           RESET
           ================================================= */

        document
            .getElementById(
                "albumForm"
            )
            .reset();


        setDefaultDate();


        /* =================================================
           CLOSE
           ================================================= */

        setTimeout(
            async function () {

                closeAlbumForm();

                await loadAlbums();

                scrollToTimeline();

            },
            700
        );


    } catch (error) {

        console.error(
            "CREATE ALBUM ERROR:",
            error
        );


        message.textContent =
            "Gagal membuat album: " +
            error.message;


    } finally {

        button.disabled =
            false;


        button.textContent =
            "Buat Album ❤️";

    }

}


/* =========================================================
   UPLOAD PHOTOS
   ========================================================= */

async function uploadPhotosToAlbum(
    albumId,
    files
) {

    /* =====================================================
       JANGAN gunakan Number(albumId).

       UUID harus dikirim sebagai UUID/string asli.
       ===================================================== */


    if (!albumId) {

        throw new Error(
            "ID album tidak ditemukan."
        );

    }


    if (!files || files.length === 0) {

        return;

    }


    const photoRows = [];


    for (
        let index = 0;
        index < files.length;
        index++
    ) {

        const file =
            files[index];


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


        const extension =
            getFileExtension(
                file.name
            );


        const safeName =
            sanitizeFileName(
                file.name
            );


        const uniqueName =
            `${Date.now()}-${index}-${safeName}`;


        const filePath =
            `${albumId}/${uniqueName}`;


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

            throw uploadError;

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
           DATABASE PHOTO ROW

           album_id tetap UUID/string.
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
       INSERT PHOTO RECORDS
       ===================================================== */

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


        if (photoInsertError) {

            throw photoInsertError;

        }


        /* =================================================
           FOTO PERTAMA MENJADI COVER
           ================================================= */

        const firstPhoto =
            photoRows[0];


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
                    albumId
                );


        if (coverError) {

            throw coverError;

        }

    }

}


/* =========================================================
   GET FILE EXTENSION
   ========================================================= */

function getFileExtension(
    fileName
) {

    const parts =
        fileName.split(".");


    if (
        parts.length < 2
    ) {

        return "";

    }


    return parts
        .pop()
        .toLowerCase();

}


/* =========================================================
   SANITIZE FILE NAME
   ========================================================= */

function sanitizeFileName(
    fileName
) {

    return fileName
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "-"
        )
        .replace(
            /-+/g,
            "-"
        );

}


/* =========================================================
   LOAD ALBUMS
   ========================================================= */

async function loadAlbums() {

    const timeline =
        document.getElementById(
            "timelineList"
        );


    timeline.innerHTML =
        `
        <div class="loading-box">
            Memuat cerita kita...
        </div>
        `;


    try {

        /* =================================================
           AMBIL ALBUM
           ================================================= */

        const {
            data:
                albumData,
            error:
                albumError
        } =
            await supabaseClient
                .from("albums")
                .select("*")
                .order(
                    "tanggal",
                    {
                        ascending:
                            true
                    }
                );


        if (albumError) {

            throw albumError;

        }


        albums =
            albumData || [];


        /* =================================================
           AMBIL FOTO
           ================================================= */

        const {
            data:
                photoData,
            error:
                photoError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            true
                    }
                );


        if (photoError) {

            throw photoError;

        }


        const photos =
            photoData || [];


        renderTimeline(
            albums,
            photos
        );


    } catch (error) {

        console.error(
            "LOAD ALBUM ERROR:",
            error
        );


        timeline.innerHTML =
            `
            <div class="empty-box">

                <h3>
                    Gagal memuat cerita
                </h3>

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
   RENDER TIMELINE
   ========================================================= */

function renderTimeline(
    albumData,
    photoData
) {

    const timeline =
        document.getElementById(
            "timelineList"
        );


    if (
        !albumData ||
        albumData.length === 0
    ) {

        timeline.innerHTML =
            `
            <div class="empty-box">

                <div style="font-size:45px;">
                    ❤️
                </div>

                <h3>
                    Belum ada cerita
                </h3>

                <p>
                    Login sebagai admin lalu
                    buat album pertama kita.
                </p>

            </div>
            `;

        return;

    }


    const sessionPromise =
        supabaseClient
            .auth
            .getSession();


    sessionPromise.then(
        function ({
            data
        }) {

            const isAdmin =
                Boolean(
                    data.session
                );


            timeline.innerHTML =
                albumData
                    .map(
                        function (
                            album
                        ) {

                            /* =================================
                               PENTING:

                               Jangan Number(album.id)
                               Jangan Number(photo.album_id)

                               Bandingkan sebagai string
                               agar UUID aman.
                               ================================= */

                            const albumPhotos =
                                photoData.filter(
                                    function (
                                        photo
                                    ) {

                                        return String(
                                            photo.album_id
                                        ) === String(
                                            album.id
                                        );

                                    }
                                );


                            const cover =
                                album.cover_url ||
                                (
                                    albumPhotos[0]
                                    ?.foto_url
                                ) ||
                                "";


                            return `
                            <article
                                class="timeline-item"
                            >

                                <div
                                    class="timeline-dot"
                                ></div>


                                <div
                                    class="timeline-card"
                                >

                                    ${
                                        cover
                                            ?
                                            `
                                            <img
                                                class="timeline-image"
                                                src="${escapeHTML(
                                                    cover
                                                )}"
                                                alt="${escapeHTML(
                                                    album.title
                                                )}"
                                                loading="lazy"
                                                onclick="openImageViewer('${escapeHTML(
                                                    cover
                                                )}')"
                                            >
                                            `
                                            :
                                            ""
                                    }


                                    <div
                                        class="timeline-content"
                                    >

                                        <div
                                            class="timeline-meta"
                                        >
                                            ${escapeHTML(
                                                formatDate(
                                                    album.tanggal
                                                )
                                            )}
                                        </div>


                                        <h3
                                            class="timeline-title"
                                        >
                                            ${escapeHTML(
                                                album.title
                                            )}
                                        </h3>


                                        ${
                                            album.cerita
                                                ?
                                                `
                                                <div
                                                    class="timeline-story"
                                                >
                                                    ${escapeHTML(
                                                        album.cerita
                                                    )}
                                                </div>
                                                `
                                                :
                                                ""
                                        }


                                        ${
                                            album.lokasi
                                                ?
                                                `
                                                <div
                                                    class="timeline-location"
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


                                        <div
                                            class="timeline-actions"
                                        >

                                            <button
                                                class="primary-button"
                                                onclick="openAlbum('${album.id}')"
                                            >
                                                Buka Album
                                                ❤️
                                            </button>


                                            ${
                                                isAdmin
                                                    ?
                                                    `
                                                    <button
                                                        class="danger-button"
                                                        onclick="deleteAlbum('${album.id}')"
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

                            </article>
                            `;

                        }
                    )
                    .join("");

        }
    );

}


/* =========================================================
   OPEN ALBUM
   ========================================================= */

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


    viewer.classList.remove(
        "hidden"
    );


    content.innerHTML =
        `
        <div class="loading-box">
            Membuka album...
        </div>
        `;


    try {

        /* =================================================
           AMBIL ALBUM

           albumId dikirim apa adanya.
           ================================================= */

        const {
            data:
                album,
            error:
                albumError
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


        /* =================================================
           AMBIL FOTO ALBUM

           UUID dibandingkan langsung.
           ================================================= */

        const {
            data:
                photos,
            error:
                photoError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .select("*")
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


        if (photoError) {

            throw photoError;

        }


        currentAlbum =
            album;


        const {
            data:
                authData
        } =
            await supabaseClient
                .auth
                .getSession();


        const isAdmin =
            Boolean(
                authData.session
            );


        const albumPhotos =
            photos || [];


        const cover =
            album.cover_url ||
            albumPhotos[0]?.foto_url ||
            "";


        content.innerHTML =
            `
            ${
                cover
                    ?
                    `
                    <img
                        src="${escapeHTML(
                            cover
                        )}"
                        class="viewer-cover"
                        alt="${escapeHTML(
                            album.title
                        )}"
                        onclick="openImageViewer('${escapeHTML(
                            cover
                        )}')"
                    >
                    `
                    :
                    ""
            }


            <span class="section-label">
                ${escapeHTML(
                    formatDate(
                        album.tanggal
                    )
                )}
            </span>


            <h2
                class="viewer-title"
            >
                ${escapeHTML(
                    album.title
                )}
            </h2>


            ${
                album.lokasi
                    ?
                    `
                    <div class="viewer-meta">
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
                    <div class="viewer-story">
                        ${escapeHTML(
                            album.cerita
                        )}
                    </div>
                    `
                    :
                    ""
            }


            <div
                class="album-grid"
                id="albumPhotoGrid"
            >

                ${
                    albumPhotos.length
                        ?
                        albumPhotos
                            .map(
                                function (
                                    photo
                                ) {

                                    return `
                                    <div
                                        class="album-photo"
                                    >

                                        <img
                                            src="${escapeHTML(
                                                photo.foto_url
                                            )}"
                                            alt="Foto ${escapeHTML(
                                                album.title
                                            )}"
                                            onclick="openImageViewer('${escapeHTML(
                                                photo.foto_url
                                            )}')"
                                            loading="lazy"
                                        >


                                        ${
                                            isAdmin
                                                ?
                                                `
                                                <button
                                                    class="album-photo-delete"
                                                    onclick="deletePhoto('${photo.id}', '${escapeHTML(
                                                        photo.foto_path
                                                    )}', '${album.id}')"
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
                        <div class="empty-box"
                             style="grid-column:1/-1;">

                            <h3>
                                Belum ada foto
                            </h3>

                            <p>
                                Tambahkan foto ke album ini.
                            </p>

                        </div>
                        `
                }

            </div>


            ${
                isAdmin
                    ?
                    `
                    <div class="add-photo-box">

                        <h3>
                            Tambahkan Foto ❤️
                        </h3>

                        <p>
                            Pilih beberapa foto sekaligus
                            untuk ditambahkan ke album ini.
                        </p>


                        <input
                            type="file"
                            id="addPhotosInput"
                            accept="image/*"
                            multiple
                        >


                        <br>
                        <br>


                        <button
                            class="primary-button"
                            onclick="addPhotosToExistingAlbum('${album.id}')"
                        >
                            Tambahkan Foto
                        </button>


                        <div
                            id="addPhotoMessage"
                            class="form-message"
                            style="margin-top:15px;"
                        >
                        </div>

                    </div>
                    `
                    :
                    ""
            }
            `;


    } catch (error) {

        console.error(
            "OPEN ALBUM ERROR:",
            error
        );


        content.innerHTML =
            `
            <div class="empty-box">

                <h3>
                    Album tidak dapat dibuka
                </h3>

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
   ADD PHOTOS TO EXISTING ALBUM
   ========================================================= */

async function addPhotosToExistingAlbum(
    albumId
) {

    const input =
        document.getElementById(
            "addPhotosInput"
        );


    const message =
        document.getElementById(
            "addPhotoMessage"
        );


    if (!input) {

        return;

    }


    const files =
        Array.from(
            input.files
        );


    if (
        files.length === 0
    ) {

        message.textContent =
            "Pilih minimal satu foto.";

        return;

    }


    const {
        data:
            authData
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!authData.session) {

        message.textContent =
            "Silakan login terlebih dahulu.";

        return;

    }


    message.textContent =
        `Mengupload ${files.length} foto...`;


    try {

        await uploadPhotosToAlbum(
            albumId,
            files
        );


        message.textContent =
            "Foto berhasil ditambahkan ❤️";


        input.value =
            "";


        setTimeout(
            async function () {

                await openAlbum(
                    albumId
                );

                await loadAlbums();

            },
            600
        );


    } catch (error) {

        console.error(
            "ADD PHOTO ERROR:",
            error
        );


        message.textContent =
            "Gagal menambahkan foto: " +
            error.message;

    }

}


/* =========================================================
   DELETE PHOTO
   ========================================================= */

async function deletePhoto(
    photoId,
    photoPath,
    albumId
) {

    const {
        data:
            authData
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!authData.session) {

        alert(
            "Silakan login sebagai admin."
        );

        return;

    }


    const confirmed =
        confirm(
            "Hapus foto ini?"
        );


    if (!confirmed) {

        return;

    }


    try {

        /* =================================================
           HAPUS FILE STORAGE
           ================================================= */

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
                "Storage delete warning:",
                storageError
            );

        }


        /* =================================================
           HAPUS DATABASE
           ================================================= */

        const {
            error:
                databaseError
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


        if (databaseError) {

            throw databaseError;

        }


        /* =================================================
           UPDATE COVER
           ================================================= */

        const {
            data:
                remainingPhotos,
            error:
                remainingError
        } =
            await supabaseClient
                .from(
                    "album_photos"
                )
                .select("*")
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


        if (remainingError) {

            throw remainingError;

        }


        if (
            remainingPhotos &&
            remainingPhotos.length > 0
        ) {

            await supabaseClient
                .from("albums")
                .update({

                    cover_url:
                        remainingPhotos[0]
                            .foto_url,

                    cover_path:
                        remainingPhotos[0]
                            .foto_path

                })
                .eq(
                    "id",
                    albumId
                );

        } else {

            await supabaseClient
                .from("albums")
                .update({

                    cover_url:
                        "",

                    cover_path:
                        ""

                })
                .eq(
                    "id",
                    albumId
                );

        }


        await openAlbum(
            albumId
        );


        await loadAlbums();


    } catch (error) {

        console.error(
            "DELETE PHOTO ERROR:",
            error
        );


        alert(
            "Gagal menghapus foto: " +
            error.message
        );

    }

}


/* =========================================================
   DELETE ALBUM
   ========================================================= */

async function deleteAlbum(
    albumId
) {

    const {
        data:
            authData
    } =
        await supabaseClient
            .auth
            .getSession();


    if (!authData.session) {

        alert(
            "Silakan login sebagai admin."
        );

        return;

    }


    const confirmed =
        confirm(
            "Hapus album ini beserta semua fotonya?"
        );


    if (!confirmed) {

        return;

    }


    try {

        /* =================================================
           AMBIL FOTO
           ================================================= */

        const {
            data:
                photos,
            error:
                photoError
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


        /* =================================================
           HAPUS STORAGE
           ================================================= */

        if (
            photos &&
            photos.length > 0
        ) {

            const paths =
                photos.map(
                    function (
                        photo
                    ) {

                        return photo.foto_path;

                    }
                );


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


        /* =================================================
           HAPUS ALBUM

           Karena ON DELETE CASCADE,
           album_photos ikut terhapus.
           ================================================= */

        const {
            error:
                deleteError
        } =
            await supabaseClient
                .from("albums")
                .delete()
                .eq(
                    "id",
                    albumId
                );


        if (deleteError) {

            throw deleteError;

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
            "Gagal menghapus album: " +
            error.message
        );

    }

}


/* =========================================================
   CLOSE ALBUM VIEWER
   ========================================================= */

function closeAlbumViewer() {

    document
        .getElementById(
            "albumViewer"
        )
        .classList.add(
            "hidden"
        );


    currentAlbum =
        null;

}


/* =========================================================
   IMAGE VIEWER
   ========================================================= */

function openImageViewer(
    imageUrl
) {

    const viewer =
        document.getElementById(
            "imageViewer"
        );


    const image =
        document.getElementById(
            "imageViewerImage"
        );


    image.src =
        imageUrl;


    viewer.classList.remove(
        "hidden"
    );

}


function closeImageViewer() {

    const viewer =
        document.getElementById(
            "imageViewer"
        );


    const image =
        document.getElementById(
            "imageViewerImage"
        );


    viewer.classList.add(
        "hidden"
    );


    image.src =
        "";

}


/* =========================================================
   PLAYLIST
   ========================================================= */

function showPlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        .classList.remove(
            "hidden"
        );

}


function closePlaylist() {

    document
        .getElementById(
            "playlistModal"
        )
        .classList.add(
            "hidden"
        );

}


/* =========================================================
   SCROLL TIMELINE
   ========================================================= */

function scrollToTimeline() {

    const section =
        document.getElementById(
            "timelineSection"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================================
   BACKWARD COMPATIBILITY
   =========================================================

   Kalau HTML lama kakak masih memakai:

   onclick="tambahKenangan()"

   maka fungsi ini tetap bekerja.
   ========================================================= */

function tambahKenangan() {

    return createAlbum();

}


/* =========================================================
   EXPOSE FUNCTIONS TO HTML
   ========================================================= */

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.loginAdmin =
    loginAdmin;

window.logoutAdmin =
    logoutAdmin;

window.openAlbumForm =
    openAlbumForm;

window.closeAlbumForm =
    closeAlbumForm;

window.createAlbum =
    createAlbum;

window.tambahKenangan =
    tambahKenangan;

window.openAlbum =
    openAlbum;

window.closeAlbumViewer =
    closeAlbumViewer;

window.addPhotosToExistingAlbum =
    addPhotosToExistingAlbum;

window.deletePhoto =
    deletePhoto;

window.deleteAlbum =
    deleteAlbum;

window.openImageViewer =
    openImageViewer;

window.closeImageViewer =
    closeImageViewer;

window.showPlaylist =
    showPlaylist;

window.closePlaylist =
    closePlaylist;

window.scrollToTimeline =
    scrollToTimeline;