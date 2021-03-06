remoteEvent = async (event) => {
    return new Promise(async (resolve) => {
        if (!event || !event.detail) {
            resolve();
            return;
        }

        const slider = document.getElementById('slider');

        if (!slider) {
            resolve();
            return;
        }

        const type = event.detail.type;

        if (type === 'next_slide') {
            const slideAnimation = event.detail.slideAnimation;
            await slider.slideNext(slideAnimation, slideAnimation);
        } else if (type === 'prev_slide') {
            const slideAnimation = event.detail.slideAnimation;
            await slider.slidePrev(slideAnimation, slideAnimation);
        } else if (type === 'slide_action') {
            await youtubePlayPause(event);
        } else if (type === 'slide_to') {
            const index = event.detail.index;
            if (index >= 0) {
                await slider.slideTo(index, 0);
            }
        }

        resolve();
    });
};

reconnectRemoteControl = () => {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement) {
            resolve();
            return;
        }

        await deckgoRemoteElement.connect();

        if (!document.getElementById('slider')) {
            resolve();
            return;
        }

        await document.getElementById('slider').slideTo(0, 300, false);

        resolve();
    });
};

initRemote = async () => {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement || !window) {
            resolve();
            return;
        }

        deckgoRemoteElement.addEventListener('event', async event => {
            await remoteEvent(event)
        });

        window.addEventListener('resize', async () => {
            await initRemoteSize();
        });

        await initDeck();

        await initRemoteSize();

        await initDeckMove();

        resolve();
    });
};

function initDeck() {
    return new Promise(async (resolve) => {
        const deck = document.getElementById('slider');

        if (!deck) {
            resolve();
            return;
        }

        deck.addEventListener('slidesDidLoad', async (slides) => {
            await initRemoteRoomServer(slides)
        });

        resolve();
    });
}

function initRemoteRoomServer(slides) {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement || !document) {
            resolve();
            return;
        }

        deckgoRemoteElement.slides = slides.detail;
        deckgoRemoteElement.server = process.env.SIGNALING_SERVER;

        // In this specific website we want to offer many "rooms"
        const roomNumber = Math.floor(Math.random() * 999);
        const roomName = 'DeckDeckGo.com #' + roomNumber + '';
        deckgoRemoteElement.room = roomName;

        const deck = document.getElementById('slider');
        if (!deck) {
            resolve();
            return;
        }

        const slideYoutube = deck.querySelector('deckgo-slide-youtube');

        if (!slideYoutube) {
            resolve();
            return;
        }

        const slotTitle = slideYoutube.querySelector('[slot=\'title\']');

        if (!slotTitle) {
            resolve();
            return;
        }

        const element = document.createElement('h3');
        element.style.margin = '0 0 16px 0px';
        element.style.color = 'initial';
        element.setAttribute('slot', 'content');

        const small = document.createElement('small');
        small.innerHTML = 'Find this presentation with the remote control 👉 ' + roomName;
        element.append(small);

        slotTitle.parentNode.insertBefore(element, slotTitle.nextSibling);

        resolve();
    });
}

function initDeckMove() {
    return new Promise(async (resolve) => {
        const deck = document.getElementById('slider');

        if (!deck) {
            resolve();
            return;
        }

        deck.addEventListener('slideNextDidChange', async () => {
            await slidePrevNext(true)
        });

        deck.addEventListener('slidePrevDidChange', async () => {
            await slidePrevNext(false)
        });

        deck.addEventListener('slideWillChange', async (event) => {
            await moveRemote(event)
        });

        deck.addEventListener('slideDrag', async (event) => {
            await scrollRemote(event)
        });

        deck.addEventListener('slideToChange', async (event) => {
            await slideToChange(event)
        });

        resolve();
    });
}

function initRemoteSize() {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement) {
            resolve();
            return;
        }

        deckgoRemoteElement.width = window.innerWidth;
        deckgoRemoteElement.height = window.innerHeight;

        const deck = document.getElementById('slider');

        if (!deckgoRemoteElement || !deck) {
            resolve();
            return;
        }

        deckgoRemoteElement.length = deck.childElementCount;

        resolve();
    });
}

function slideToChange(event) {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement || !event) {
            resolve();
            return;
        }

        const slideIndex = event.detail;

        await deckgoRemoteElement.slideTo(slideIndex, 0);

        resolve();
    });
}

function slidePrevNext(next) {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement) {
            resolve();
            return;
        }

        if (next) {
            await deckgoRemoteElement.nextSlide();
        } else {
            await deckgoRemoteElement.prevSlide();
        }

        resolve();
    });
}

function moveRemote(event) {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement) {
            resolve();
            return;
        }

        await deckgoRemoteElement.moveDraw(event.detail, '300ms');

        resolve();
    });
}

function scrollRemote(event) {
    return new Promise(async (resolve) => {
        const deckgoRemoteElement = document.querySelector("deckgo-remote");

        if (!deckgoRemoteElement) {
            resolve();
            return;
        }

        await deckgoRemoteElement.moveDraw(event.detail, '0ms');

        resolve();
    });
}

function youtubePlayPause(event) {
    return new Promise(async (resolve) => {
        const deck = document.getElementById('slider');

        if (!deck) {
            resolve();
            return;
        }

        const index = await deck.getActiveIndex();

        const youtubeSlideElement = document.querySelector('.deckgo-slide-container:nth-child(' + (index + 1) + ')');

        if (!youtubeSlideElement || youtubeSlideElement.tagName !== 'deckgo-slide-youtube'.toUpperCase()) {
            resolve();
            return;
        }

        if (event.detail.action === 'youtube_pause') {
            await youtubeSlideElement.pause();
        } else {
            await youtubeSlideElement.play();
        }

        resolve();
    });
}
