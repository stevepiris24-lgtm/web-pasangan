/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://lzuqaqysqmavxxstifjy.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_XAbDjSXAHywqAGJ4eWz3OA_iO5PDNiF";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   CONFIG
===================================================== */

const START_DATE =
    "2024-04-24";


let currentUser = null;

let currentAlbum = null;


/* =====================================================
   DOM
===================================================== */

const albumGrid =
    document.getElementById("albumGrid");


const timelineContainer =
    document.getElementById("timelineContainer");


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        calculateTogether();

        setInterval(
            calculateTogether,
            1000
        );


        await checkLogin();

        await loadAlbums();

        await loadTimeline();

    }
);


/* =====================================================
   CALCULATE TOGETHER
===================================================== */

function calculateTogether() {

    const start =
        new Date(
            START_DATE + "T00:00:00"
        );


    const now =
        new Date();


    const difference =
        now - start;


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


    document.getElementById(
        "daysTogether"
    ).textContent =
        days.toLocaleString("id-ID");


    document.getElementById(
        "hoursTogether"
    ).textContent =
        hours.toLocaleString("id-ID") +
        " jam bersama";

}


/* =====================================================
   LOGIN CHECK
===================================================== */

async function checkLogin() {

    const {
        data
    } =
        await supabaseClient
            .auth
            .getSession();


    currentUser =
        data.session
            ? data.session.user
            : null;


    updateAdminUI();

}


/* =====================================================
   ADMIN UI
===================================================== */

function updateAdminUI() {

    const adminButton =
        document.getElementById(
            "adminButton"
        );


    if (currentUser) {

        adminButton.textContent =
            "Logout";

        adminButton.onclick =
            logout;


        document.getElementById(
            "addAlbumButton"
        ).style.display =
            "inline-block";


        document.getElementById(
            "addTimelineButton"
        ).style.display =
            "inline-block";

    } else {

        adminButton.textContent =
            "Admin";

        adminButton.onclick =
            openLoginModal;


        document.getElementById(
            "addAlbumButton"
        ).style.display =
            "none";


        document.getElementById(
            "addTimelineButton"
        ).style.display =
            "none";

    }

}


/* =====================================================
   LOGIN
===================================================== */

document.getElementById(
    "loginForm"
).addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


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


        message.textContent =
            "Sedang masuk...";


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

            message.textContent =
                error.message;

            return;

        }


        currentUser =
            data.user;


        closeLoginModal();

        updateAdminUI();

        showToast(
            "Login berhasil ❤️"
        );

        await loadAlbums();

    }
);


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    await supabaseClient
        .auth
        .signOut();


    currentUser = null;

    updateAdminUI();

    showToast(
        "Admin berhasil logout"
    );

    await loadAlbums();

}


/* =====================================================
   AUTH STATE
===================================================== */

supabaseClient
    .auth
    .onAuthStateChange(
        (
            event,
            session
        ) => {

            currentUser =
                session
                    ? session.user
                    : null;

            updateAdminUI();

        }
    );


/* =====================================================
   LOAD ALBUM
===================================================== */

async function loadAlbums() {

    albumGrid.innerHTML =
        `
        <div class="empty-state">
            <div class="empty-icon">
                ⏳
            </div>
            Memuat album...
        </div>
        `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        albumGrid.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">
                    ⚠️
                </div>
                Gagal memuat album.
            </div>
            `;

        return;

    }


    if (!data.length) {

        albumGrid.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">
                    📸
                </div>

                <h3>
                    Belum ada album
                </h3>

                <p>
                    Album kenangan kita akan
                    muncul di sini.
                </p>
            </div>
            `;

        return;

    }


    albumGrid.innerHTML = "";


    for (
        const album of data
    ) {

        const count =
            await getPhotoCount(
                album.id
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "album-card";


        const cover =
            album.cover_url ||
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80";


        card.innerHTML =
            `
            <div class="album-cover">

                <img
                    src="${escapeHTML(cover)}"
                    alt="${escapeHTML(album.title)}"
                >

                <div class="album-count">
                    📷 ${count} foto
                </div>

            </div>


            <div class="album-info">

                <h3>
                    ${escapeHTML(album.title)}
                </h3>

                <p>
                    ${escapeHTML(
                        album.description || 
                        "Cerita kecil kita."
                    )}
                </p>

                <div class="album-date">
                    ${formatDate(
                        album.event_date
                    )}
                </div>


                <div class="album-actions">

                    <button
                        class="album-open"
                        onclick="openAlbum('${album.id}')"
                    >
                        Buka Album
                    </button>

                    ${
                        currentUser
                        ?
                        `
                        <button
                            class="album-add"
                            onclick="openPhotoModal(
                                '${album.id}',
                                '${escapeAttribute(album.title)}'
                            )"
                        >
                            + Foto
                        </button>

                        <button
                            class="album-add"
                            onclick="deleteAlbum('${album.id}')"
                            title="Hapus album"
                        >
                            🗑
                        </button>
                        `
                        :
                        ""
                    }

                </div>

            </div>
            `;


        albumGrid.appendChild(card);

    }

}


/* =====================================================
   GET PHOTO COUNT
===================================================== */

async function getPhotoCount(
    albumId
) {

    const {
        count
    } =
        await supabaseClient
            .from("photos")
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "album_id",
                albumId
            );


    return count || 0;

}


/* =====================================================
   OPEN ALBUM
===================================================== */

async function openAlbum(
    albumId
) {

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

        showToast(
            "Album gagal dibuka"
        );

        return;

    }


    currentAlbum =
        album;


    const {
        data: photos,
        error
    } =
        await supabaseClient
            .from("photos")
            .select("*")
            .eq(
                "album_id",
                albumId
            )
            .order(
                "photo_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        return;

    }


    const content =
        document.getElementById(
            "albumModalContent"
        );


    content.innerHTML =
        `
        <div class="album-modal-top">

            <div>

                <span>
                    MEMORY ALBUM
                </span>

                <h2>
                    ${escapeHTML(album.title)}
                </h2>

                <p>
                    ${escapeHTML(
                        album.description || ""
                    )}
                </p>

            </div>


            ${
                currentUser
                ?
                `
                <button
                    class="primary-button"
                    onclick="openPhotoModal(
                        '${album.id}',
                        '${escapeAttribute(album.title)}'
                    )"
                >
                    + Tambah Foto
                </button>
                `
                :
                ""
            }

        </div>


        <div class="photo-grid">

            ${
                photos.length
                ?
                photos.map(
                    photo => {

                        return `
                        <div class="photo-item">

                            <img
                                src="${escapeHTML(photo.photo_url)}"
                                alt="${escapeHTML(
                                    photo.caption || "Foto"
                                )}"
                                onclick="viewPhoto(
                                    '${escapeAttribute(photo.photo_url)}'
                                )"
                            >

                            ${
                                currentUser
                                ?
                                `
                                <button
                                    class="delete-photo"
                                    onclick="deletePhoto(
                                        '${photo.id}',
                                        '${escapeAttribute(photo.photo_url)}'
                                    )"
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

                    <div class="empty-icon">
                        📷
                    </div>

                    <h3>
                        Belum ada foto
                    </h3>

                    <p>
                        Tambahkan foto pertama
                        ke album ini.
                    </p>

                </div>
                `
            }

        </div>
        `;


    document.getElementById(
        "albumModal"
    ).classList.add("show");

}


/* =====================================================
   ADD ALBUM
===================================================== */

document.getElementById(
    "addAlbumButton"
).addEventListener(
    "click",
    openAddAlbumModal
);


document.getElementById(
    "albumForm"
).addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (!currentUser) {

            showToast(
                "Silakan login sebagai admin"
            );

            return;

        }


        const title =
            document.getElementById(
                "albumTitle"
            ).value.trim();


        const description =
            document.getElementById(
                "albumDescription"
            ).value.trim();


        const eventDate =
            document.getElementById(
                "albumDate"
            ).value;


        const coverFile =
            document.getElementById(
                "albumCover"
            ).files[0];


        let coverUrl = "";


        try {

            /* ================================
               UPLOAD COVER
            ================================= */

            if (coverFile) {

                const extension =
                    getExtension(
                        coverFile.name
                    );


                const filename =
                    `covers/${crypto.randomUUID()}.${extension}`;


                const {
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("album-photos")
                        .upload(
                            filename,
                            coverFile,
                            {
                                cacheControl: "3600",
                                upsert: false
                            }
                        );


                if (uploadError) {

                    throw uploadError;

                }


                const {
                    data
                } =
                    supabaseClient
                        .storage
                        .from("album-photos")
                        .getPublicUrl(
                            filename
                        );


                coverUrl =
                    data.publicUrl;

            }


            /* ================================
               INSERT ALBUM
            ================================= */

            const {
                error
            } =
                await supabaseClient
                    .from("albums")
                    .insert({

                        title,

                        description,

                        event_date:
                            eventDate || null,

                        cover_url:
                            coverUrl

                    });


            if (error) {

                throw error;

            }


            closeAddAlbumModal();

            document.getElementById(
                "albumForm"
            ).reset();


            showToast(
                "Album berhasil dibuat ❤️"
            );


            await loadAlbums();

            await loadTimeline();

        }

        catch(error) {

            console.error(error);

            showToast(
                "Gagal membuat album: " +
                error.message
            );

        }

    }
);


/* =====================================================
   ADD PHOTO
===================================================== */

document.getElementById(
    "photoForm"
).addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();


        if (!currentUser) {

            showToast(
                "Login admin terlebih dahulu"
            );

            return;

        }


        const albumId =
            document.getElementById(
                "selectedAlbumId"
            ).value;


        const files =
            document.getElementById(
                "photoFiles"
            ).files;


        const caption =
            document.getElementById(
                "photoCaption"
            ).value.trim();


        const photoDate =
            document.getElementById(
                "photoDate"
            ).value;


        if (!files.length) {

            showToast(
                "Pilih foto terlebih dahulu"
            );

            return;

        }


        const progress =
            document.getElementById(
                "uploadProgress"
            );


        progress.innerHTML =
            "Mengupload foto...";


        try {

            for (
                let i = 0;
                i < files.length;
                i++
            ) {

                const file =
                    files[i];


                const extension =
                    getExtension(
                        file.name
                    );


                const filename =
                    `albums/${albumId}/${crypto.randomUUID()}.${extension}`;


                /* =========================
                   UPLOAD STORAGE
                ========================= */

                const {
                    error:
                    uploadError
                } =
                    await supabaseClient
                        .storage
                        .from("album-photos")
                        .upload(
                            filename,
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


                /* =========================
                   PUBLIC URL
                ========================= */

                const {
                    data:
                    publicData
                } =
                    supabaseClient
                        .storage
                        .from("album-photos")
                        .getPublicUrl(
                            filename
                        );


                /* =========================
                   INSERT DATABASE
                ========================= */

                const {
                    error:
                    dbError
                } =
                    await supabaseClient
                        .from("photos")
                        .insert({

                            album_id:
                                albumId,

                            photo_url:
                                publicData.publicUrl,

                            caption,

                            photo_date:
                                photoDate || null

                        });


                if (dbError) {

                    throw dbError;

                }


                progress.innerHTML =
                    `Upload ${i + 1} dari ${files.length} berhasil...`;

            }


            progress.innerHTML =
                "Semua foto berhasil diupload ❤️";


            document.getElementById(
                "photoForm"
            ).reset();


            setTimeout(
                async () => {

                    closePhotoModal();

                    await loadAlbums();

                    if (currentAlbum) {

                        await openAlbum(
                            albumId
                        );

                    }

                    showToast(
                        "Foto berhasil ditambahkan ❤️"
                    );

                },
                700
            );

        }

        catch(error) {

            console.error(error);

            progress.innerHTML =
                "Gagal upload: " +
                error.message;

        }

    }
);


/* =====================================================
   DELETE PHOTO
===================================================== */

async function deletePhoto(
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

        /* =========================
           EXTRACT STORAGE PATH
        ========================= */

        const marker =
            "/album-photos/";


        const index =
            photoUrl.indexOf(
                marker
            );


        if (index !== -1) {

            const storagePath =
                photoUrl.substring(
                    index + marker.length
                );


            await supabaseClient
                .storage
                .from("album-photos")
                .remove([
                    storagePath
                ]);

        }


        /* =========================
           DELETE DATABASE
        ========================= */

        const {
            error
        } =
            await supabaseClient
                .from("photos")
                .delete()
                .eq(
                    "id",
                    photoId
                );


        if (error) {

            throw error;

        }


        showToast(
            "Foto dihapus"
        );


        if (currentAlbum) {

            await openAlbum(
                currentAlbum.id
            );

        }


        await loadAlbums();

    }

    catch(error) {

        console.error(error);

        showToast(
            "Gagal menghapus foto"
        );

    }

}


/* =====================================================
   DELETE ALBUM
===================================================== */

async function deleteAlbum(
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

        const {
            error
        } =
            await supabaseClient
                .from("albums")
                .delete()
                .eq(
                    "id",
                    albumId
                );


        if (error) {

            throw error;

        }


        showToast(
            "Album berhasil dihapus"
        );


        await loadAlbums();

        await loadTimeline();

    }

    catch(error) {

        console.error(error);

        showToast(
            "Gagal menghapus album"
        );

    }

}


/* =====================================================
   TIMELINE
===================================================== */

async function loadTimeline() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("albums")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(error);

        return;

    }


    if (!data.length) {

        timelineContainer.innerHTML =
            `
            <div class="empty-state">
                <div class="empty-icon">
                    💌
                </div>

                <h3>
                    Cerita kita akan dimulai di sini
                </h3>

                <p>
                    Buat album untuk menambahkan
                    cerita pertama.
                </p>

            </div>
            `;

        return;

    }


    timelineContainer.innerHTML =
        data.map(
            album => {

                return `
                <article
                    class="timeline-item"
                >

                    <div
                        class="timeline-dot"
                    ></div>


                    <div
                        class="timeline-date"
                    >
                        ${formatDate(
                            album.event_date
                        )}
                    </div>


                    <div
                        class="timeline-content"
                    >

                        <h3>
                            ${escapeHTML(
                                album.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                album.description ||
                                "Sebuah cerita kecil yang ingin kita simpan selamanya."
                            )}
                        </p>


                        <button
                            class="text-button"
                            onclick="openAlbum(
                                '${album.id}'
                            )"
                        >
                            Lihat kenangan →
                        </button>

                    </div>

                </article>
                `;

            }
        ).join("");

}


/* =====================================================
   VIEW PHOTO
===================================================== */

function viewPhoto(
    url
) {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "modal show";


    modal.innerHTML =
        `
        <div
            style="
                max-width:95vw;
                max-height:95vh;
                position:relative;
            "
        >

            <button
                onclick="this.parentElement.parentElement.remove()"
                style="
                    position:absolute;
                    right:-15px;
                    top:-15px;
                    width:38px;
                    height:38px;
                    border:1px solid #444;
                    background:#202024;
                    color:white;
                    border-radius:50%;
                    font-size:20px;
                    z-index:2;
                "
            >
                ×
            </button>

            <img
                src="${escapeHTML(url)}"
                style="
                    max-width:95vw;
                    max-height:90vh;
                    object-fit:contain;
                    border-radius:15px;
                "
            >

        </div>
        `;


    document.body.appendChild(
        modal
    );

}


/* =====================================================
   MODAL HELPERS
===================================================== */

function openLoginModal() {

    document.getElementById(
        "loginModal"
    ).classList.add("show");

}


function closeLoginModal() {

    document.getElementById(
        "loginModal"
    ).classList.remove("show");

}


function openAddAlbumModal() {

    if (!currentUser) {

        openLoginModal();

        return;

    }


    document.getElementById(
        "addAlbumModal"
    ).classList.add("show");

}


function closeAddAlbumModal() {

    document.getElementById(
        "addAlbumModal"
    ).classList.remove("show");

}


function openPhotoModal(
    albumId,
    albumTitle
) {

    if (!currentUser) {

        openLoginModal();

        return;

    }


    document.getElementById(
        "selectedAlbumId"
    ).value =
        albumId;


    document.getElementById(
        "photoAlbumName"
    ).textContent =
        albumTitle;


    document.getElementById(
        "photoModal"
    ).classList.add("show");

}


function closePhotoModal() {

    document.getElementById(
        "photoModal"
    ).classList.remove("show");

}


function closeAlbumModal() {

    document.getElementById(
        "albumModal"
    ).classList.remove("show");

}


function openPlaylist() {

    document.getElementById(
        "playlistModal"
    ).classList.add("show");

}


function closePlaylist() {

    document.getElementById(
        "playlistModal"
    ).classList.remove("show");

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    date
) {

    if (!date) {

        return "Tanggal belum diatur";

    }


    const d =
        new Date(
            date + "T00:00:00"
        );


    return d.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


/* =====================================================
   EXTENSION
===================================================== */

function getExtension(
    filename
) {

    const parts =
        filename.split(".");


    return (
        parts[
            parts.length - 1
        ] || "jpg"
    ).toLowerCase();

}


/* =====================================================
   HTML SECURITY
===================================================== */

function escapeHTML(
    value
) {

    if (!value) {

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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    ).replace(
        /`/g,
        "&#096;"
    );

}


/* =====================================================
   TOAST
===================================================== */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


/* =====================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
===================================================== */

document.querySelectorAll(
    ".modal"
).forEach(
    modal => {

        modal.addEventListener(
            "click",
            function(e) {

                if (
                    e.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }
);