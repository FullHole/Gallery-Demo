const gallery = {
    data() {
        return {
            uploadType: true,
            gallery: [],
            galleryDom: '',
            galleryPrevWidth: '',
            minHeight: 110,
            maxHeight: 160,
            screenRatio: 1,

            interval: false,
            count: 0,
            visibility: false,
            delMode: false,
        }
    },
    components: {},
    methods: {
        //Обработка и добавление в галлерю структуры содержащую ссылку на изображение
        addImage(imgStruct) {
            this.gallery.push(imgStruct);
            this.setImagesParam(imgStruct);
            this.calcRowsHeight();
        },
        //Обработка Json списка.
        addGalleryList(list) {
            list.forEach(image => {
                this.setImagesParam(image);
            });
            this.gallery = this.gallery.concat(list);

            this.calcRowsHeight();
        },
        //Добавление служебных параметров в структуру
        setImagesParam(image) {
            //добавляем параметры
            this.$set(image, 'ratio', parseFloat((image.width / image.height).toFixed(3)));
            this.$set(image, 'rowHeight', this.minHeight);


        },
        //Установка параметров отображения в зависимости от ширины экрана
        calcImgParam() {
            this.screenRatio = window.devicePixelRatio;
            if(this.screenRatio > 2){
                this.screenRatio = this.screenRatio / 2;
            }

            if (this.galleryDom.clientWidth < 420) {
                this.minHeight = 60;
                this.maxHeight = 70;
                
            } else if(this.galleryDom.clientWidth < 720 && this.screenRatio!=1){
                this.minHeight = 60 * this.screenRatio;
                this.maxHeight = 70 * this.screenRatio;
                
            } else if( this.screenRatio!=1){
                this.minHeight = 100 * this.screenRatio;
                this.maxHeight = 160 * this.screenRatio;
            }
            else {
                this.minHeight = 110 * this.screenRatio;
                this.maxHeight = 160 * this.screenRatio;
            }
        },
        calcWidth() {
            
            this.galleryDom = document.querySelector(".gallery");
            this.calcImgParam();
            //Привязка нажатия к диву.
            this.galleryDom.addEventListener('mousedown', (event) => {    
                this.delModeOff(event);                
            });
            this.screenRatio = window.devicePixelRatio;

            this.galleryPrevWidth = this.galleryDom.clientWidth;
            window.addEventListener('resize', () => {
                //Проверяем входит ли Gallery в указаные размеры, а так же не даем выполняться если параметры не изменились
                if (this.galleryDom.clientWidth >= 320 && this.galleryDom.clientWidth <= 860 && this.galleryPrevWidth != this.galleryDom.clientWidth) {
                    this.galleryPrevWidth = this.galleryDom.clientWidth;
                    
                    
                    this.calcImgParam();
                    this.calcRowsHeight();
                }
            });
        },
        //Функция подсчета высоты одного ряда, возвращает конец ряда
        calcRow(rowStart) {
            let sum = 0;
            let rowEnd = rowStart;
            let rowRatio = 0;
            let heightShift = 0;
            //Высчитывается длинна ширины картинок в ряду, пока не превысит ширину области.
            for (let i = rowStart; i < this.gallery.length && ((sum + this.gallery[i].ratio * this.minHeight + 10) <= this.galleryPrevWidth); i++) {
                //Устанавливаем минимальную высоту картинки, как текущую.
                this.gallery[i].rowHeight = this.minHeight;
                //Вычисляем ширину  одной картинки с минимальной высотой и прибавляем это к сумме ширин пойденых кртинок в текущем ряду
                sum += this.gallery[i].ratio * this.minHeight + 10;
                //Вычисляем коэфицент увеличинения ширины ряда, при изменении высоты на 1px
                rowRatio += this.gallery[i].ratio * 1;
                //Находим конец ряда
                rowEnd = i;
            }

            //Вычисляем величину на размер которой необходимо увеличить высоту картинок в ряду 
            heightShift = parseFloat(((this.galleryPrevWidth - sum - 1) / rowRatio).toFixed(3));
            //проверяем что у нас больше одной картинки в ряду
            if ((rowStart - rowEnd) != 0) {
                //Проверяем увеличие высоты не превысит установленный максимум
                if (((heightShift + this.minHeight) < this.maxHeight) || rowEnd != (this.gallery.length - 1)) {
                    this.setRowHeight(rowStart, rowEnd, heightShift);
                }
            }
            return rowEnd;

        },
        //Установка единой высоты у всех картинок в ряду
        setRowHeight(rowStart, rowEnd, heightShift) {
            for (let i = rowStart; i <= rowEnd; i++) {
                this.gallery[i].rowHeight += heightShift;

            }

        },
        //Передаёт индекс изображения в функцию подсчета ряда.
        calcRowsHeight() {
            for (let i = 0; i < this.gallery.length; i++) {
                i = this.calcRow(i);
            }
        },
        //Подсчет длительности клика
        startCount() {
            if (!this.interval) {

                this.interval = setInterval(() => {
                    this.count++;
                    //остановка счетчика и включение режима удаления картинок.
                    if (this.count > 2) {

                        this.stopCount();
                        this.delModeOn();
                    }
                }, 250)

            }

        },
        //остановка счетчика.
        stopCount() {
            if (this.interval) {
                clearInterval(this.interval)
                this.interval = false;
                this.count = 0;
            }

        },
        //Удаление картинки
        delImg(img) {
            let index = this.gallery.indexOf(img);
            this.gallery.splice(index, 1);
            this.calcRowsHeight();
        },
        //Включение режима удаления
        delModeOn() {
            this.visibility = true;
            this.galleryDom.style["background-color"] = '#3a373779';
        },
        //Выключение режима удаления
        delModeOff(event) {
            
            if (event.target.className != 'del-btn') {
               
                this.visibility = false;
                this.galleryDom.style["background-color"] = 'transparent';
            }

        },
        //Отключене плейсхолдера при загрузке картинки.
        placeholderDis(event) {
            event.target.style.visibility = 'visible';
            //event.target.parentNode)
            event.target.parentNode.classList.toggle('image-loading')
        },



    },
    mounted() {

        this.calcWidth();

    },

    template: `<div class="gallery">
                <div v-for="image in gallery" :class="{'image-wrapper-dm': visibility}" :key="image.url" class="image-wrapper image-loading" >
                <div class="img-hover" :class="{'img-hover-visible': visibility}" >
                <button class="del-btn" @click.stop.prevent="delImg(image)" @touchstart.stop.prevent="delImg(image)"></button>
                </div>       
                    <img :src="image.url" @load="placeholderDis($event)":height="image.rowHeight" class="gallery-img" @mousedown.stop="startCount" @mouseleave="stopCount"
                    @mouseup.stop="stopCount" @contextmenu.stop.prevent
                    @touchstart.stop="startCount" @touchend="stopCount" @touchcancel="stopCount" @drag="stopCount">
                </div>
             </div> 
`
}
