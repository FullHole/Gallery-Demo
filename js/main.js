const app = new Vue({
    el: '#app',
    data: {
        errorMessages: [],
    },
    components: {gallery, upload, error},
    methods: {
        getJson(url) {
            return fetch(url)
                .then(result => result.json())
                .catch(error => {
                    this.showError(`${error} Cant load ${url}`);
                })
        },
        showError(error) {
            this.errorMessages.push(error);
            //console.log(error);
        },

        closeError(index) {
            this.errorMessages.splice(index, 1);
        }
        
        
    },
    mounted() {
        
    },
    
})