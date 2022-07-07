const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);



const PLAYER_STORAGE_KEY = 'My Music';
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playlist = $('.playlist');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const arraySongPlayed = [];
const repeatBtn = $('.btn-repeat');
const song = $('.song');
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    
   
    songs: [
        {
            name: 'Circle of love',
            singer: 'fisher',
            path: './Music/Listen to after love by fishy in Related tracks- after love playlist online for free on SoundCloud.mp3',
            image: './image/circle_love.jpg'
        },

        {
            name: 'Anniverse',
            singer: 'Linh Thộn',
            path: './Music/chacchanlladccualo.mp3',
            image: './image/Linh-thon.jpg'
        },

        {
            name: 'Imphetamin',
            singer: 'Jimmi ngủ yên',
            path: './Music/IMPHÊTAMIN - jimmi ngủ yên by Trung Tâm Băng Đĩa Lậu Hải Ngoại.mp3',
            image: './image/imphetamin.jpg'
        },

        {
            name: 'Yêu em qua dòng tin nhắn',
            singer: 'MCK - Nân',
            path: './Music/Yeqdtn.m4a',
            image: './image/mck-nan.jpg'
        }
    ],

    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },


    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        } )
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index===this.currentIndex ? 'active': ''}" data-index="${index}">
                 <div class="thumb" style="background-image: url('${song.image}')">
                 </div>
                 <div class="body">
                   <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                 </div>
                 <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                 </div>
             </div>
            `;
        })
        playlist.innerHTML = htmls.join('');
    },

    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // Xử lý cd quay và dừng
        const cdThumbAnimate =  cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }],
            {
                duration: 10000, // 10s
                iteration: Infinity,
            }
        )
        cdThumbAnimate.pause();

        // Xử lý phóng to, thu nhỏ cd
        document.onscroll = function(e) {
            const scrollTop = window.scrollY;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth/ cdWidth;
        }
        // Xử lý khi click play 
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();         
            }
            else {
              audio.play();      
            } 
          //  Khi song được play 
            audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add("playing");
                cdThumbAnimate.play();
            }

            //  Khi song pause 
            audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove("playing");
                cdThumbAnimate.pause();
            }
        }
        // Xử lý thanh hiển thị thời gian play songs
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100);
                progress.value = progressPercent;
            }       
        }


        // Xử lý khi tua
        progress.onchange = function(e) {
            const seekTime= audio.duration * e.target.value / 100; //e.target là lấy thằng element đang thực hiện event
            // nhưng những thằng con bên trong cái element đó k thể thực hiện những lệnh khi dùng e.target
            audio.currentTime = seekTime;
            
        }
        // Xử lý next bài hát
        nextBtn.onclick = function(e) {
           
            if(_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        // Xử lý khi prev bài hát
        prevBtn.onclick = function(e) {
            if(_this.isRandom) {
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        }
        // Xử lý khi bật tắt random
        randomBtn.onclick = function(e) {

            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);           
        }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                _this.loadCurrentSong();
                audio.play();
                _this.render();
                 _this.scrollToActiveSong();

            }
            else {

                nextBtn.click(); //tự bấm click vào nút next
            }
            
        }

        // Xử lý repeat
        repeatBtn.onclick= function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat);

            repeatBtn.classList.toggle('active',_this.isRepeat);
        }
        
        // Lắng nghe click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            // Chỉ cho click vào những thằng chưa active và click vào option 
            if(songNode|| e.target.closest('.option')) 
             {
                //  Xử lý click vào song 
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                // Xử lý khi click vào song option 
                if(e.target.closest('.option')) {

                }
            }
        }
    },

    loadCurrentSong: function() {
        
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

    },

    nextSong: function() {
        this.currentIndex ++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function() {
        var prevIndex= this.currentIndex --;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length-1;
        }
        this.loadCurrentSong();
    },
    
    playRandomSong: function() {
        arraySongPlayed.push(this.currentIndex); 
        if(arraySongPlayed.length === this.songs.length) {
            arraySongPlayed.splice(0,arraySongPlayed.length);
        }

        do {
            this.currentIndex = Math.floor(Math.random() * this.songs.length);            
        }
        while(arraySongPlayed.includes(this.currentIndex));
        this.loadCurrentSong();
    },

    scrollToActiveSong:function () {
        setTimeout(function () {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 300);
   },
    start: function() {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // Định nghĩa các thuộc tính
        this.defineProperties();
        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();
        // Lắng nghe và xử lý events
        this.handleEvents();
        // Render danh sách bài hát
        this.render();
        // Hiển thị trang thái ban đầu của button repeat & random
      //  randomBtn.classList.toggle('active', this.isRandom);           
       // repeatBtn.classList.toggle('active',this.isRepeat);

    }
}

app.start();
