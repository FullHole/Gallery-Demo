const upload = {
    data(){
        return {
            uploadType: true,
            catalogUrl: 'https://don16obqbay2c.cloudfront.net/frontend-test-task/gallery-images.json',
            pattern: /((https?|ftp):\/\/)(w{3}\.)?(([a-zA-Z0-9]+-?)*([a-zA-Z0-9]+\.))+([a-zA-Z0-9]+\/)([\w$-.+!*'()\[\]\/]+).(jpeg|gif|png|svg|jpg)$/,
            inputUrl: '',
            file: '',
            filePreload: '',
            fileReader: new FileReader(),
            activeDrag: false,
        }
    },
    components: {},
    methods: {
        //Обработка выбранного типа загрузки
        getLoad() {
            if (this.uploadType) {
                this.handleUrlLoad();
            } else {
                this.handleFileUpload();
            }

        },
        //Промис, для того что бы была возможность считать параметры агруженого файла
        getImage(src) {
            return new Promise((resolve, reject) => {
                let img = new Image();
                img.addEventListener('load', () => resolve(img));
                img.addEventListener('error', (err) => reject(err));
                img.src = src;
            })
        },
        //Поиск дубликатов в галерее
        findDup(url) {
            let find = this.$parent.$refs.gallery.gallery.find(image => image.url == url);
            if (find) {
                return true;
            }
            return false;

        },
        //Загрузка по ссылке
        handleUrlLoad() {
            //Проверка ссылки на валидность
            if (this.urlCheck(this.inputUrl)) {
                //проверка на наличие дублей
                if (!this.findDup(this.inputUrl)) {
                    //Ожидание загрузки
                    this.getImage(this.inputUrl)
                        .then(img => {
                            //Добавление в галлерею
                            this.$parent.$refs.gallery.addImage({ url: img.src, height: img.height, width: img.width, });
                        })
                        .catch((error) => {
                            this.$parent.showError(`${error}Cant load ${this.inputUrl}`);
                        });
                }
                else {
                    this.$parent.showError(`Image ${this.inputUrl} already in galery`);
                }
            } else {
                this.$parent.showError(`Incorrect Url ${this.inputUrl}`);
            }

        },
        //Загрузка по Drag And Drop
        handleDndLoad(url) {
            if (!this.findDup(url)) {
                this.getImage(url)
                    .then(img => {
                        
                        this.$parent.$refs.gallery.addImage({ url: img.src, height: img.height, width: img.width, });
                    })
                    .catch((error) => {
                        this.$parent.showError(`${error}Cant load ${url}`);
                    });
            }
            else {
                this.$parent.showError(`Image ${img.src} already in galery`);
            }

        },
        //Проверка Ссылки на соответствие с патерном
        urlCheck(url) {
            return this.pattern.test(url);
        },
        //Поиск дубликатов из загружаемого Json и галерии
        findFileDup() {
            for (let i = 0; i < this.filePreload.length; i++) {
                if (this.findDup(this.filePreload[i].url)) {
                    this.$parent.showError(`Image ${this.filePreload[i].url} already in galery`);
                    this.filePreload.splice(i, 1);
                    i--;
                }
            }


        },
        //Обработка загружаемого Json и запись в галлерею
        handleFileUpload() {

            this.file = document.querySelector(".json-upload").files[0];

            this.fileReader.onload = () => {
                this.filePreload = JSON.parse(this.fileReader.result).galleryImages;
                this.findFileDup();
                this.$parent.$refs.gallery.addGalleryList(this.filePreload);
            };
            this.fileReader.readAsText(this.file);

        },
        //Загрузка заранее заданного списка изображений
        loadPresetImages(url) {
            this.$parent.getJson(url)
                .then(data => {

                    if (data) {
                        this.$parent.$refs.gallery.addGalleryList(data.galleryImages);
                    }

                })
                .catch(error => {
                    this.$parent.showError(`${error} Cant load ${url}`);
                });
        },
        //Обработка файла сброшеного в зону Drag and Drop
        handleFileDrop(ev) {
            //Выключаем стиль зоны DnD
            this.activeDrag = false;

            for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                //Проверяем тип загружаемых файлов
                if (ev.dataTransfer.files[i].type.includes('image')) {
                                this.$parent.$refs.upload.handleDndLoad(URL.createObjectURL(ev.dataTransfer.files[i]));
                            }                
            }        
        },
        //Включаем тригер для включения стиля зоны DnD
        dragOn() {
            this.activeDrag = true;
        },
        dragOff() {
            this.activeDrag = false;
        }

    },
    mounted() {
        this.loadPresetImages(`${this.catalogUrl}`);

    },
    computed: {

    },
    template: `<div class="upload-wrapper">
    <div class="upload-select">
    <span class="upload-type" @click="uploadType = true">По URL</span><span class="upload-type" @click="uploadType = false">Файлом</span>
    </div>
    <form action="#" class="upload-form" :class="{drop_zone: activeDrag}" id="drop_zone" @dragover.prevent @drop.prevent @drop="handleFileDrop" @dragleave="dragOff" @dragover="dragOn" >
    <input type="url" v-model="inputUrl" class="img-url" v-show="uploadType" placeholder="https://example.com/example.jpg">
    <input type="file" class="json-upload" ref="file" accept=".json" v-show="!uploadType">
    <button  @click="getLoad" class="upload-button">Загрузка</button>
    </form>
            </div>`

}