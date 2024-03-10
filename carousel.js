/** ver. 1 */

class CarouselSlide {
    constructor(element){

        /** @type {HTMLElement} 슬라이드 아이템이 들어 갈 html 태그 */
        this.element = element,
    
        /** @type {HTMLElement} 슬라이드 되는 태그의 부모 */
        this.wrapper = null,

        /** @type {HTMLElement} 슬라이드 아이템을 담는 태그, 슬라이드 이동하는 태그 */
        this.slideInner = null,

        /** @type {HTMLElement} 페이지네이션 아이템을 담는 태그 */
        this.paginationInner = null;

        /** @type {number} 이동중인 슬라이드 inner left 값 */
        this.left = 0;
        
        /** @type {number} 현재 슬라이드 left 값 */
        this.currLeft = 0;

        /** @type {number} 현재 슬라이드 번호 */
        this.slideIdx = 0;

        /** @type {number} 이전 마우스, 터치 pageX */
        this.prevX = null;

        /** @type {string} */
        this.isDrirection = "";

        /** @type {number} mouse, touch move pageX */
        this.swiperX = -1;

        /** @type {number} mouse, touch move pageY */
        this.swiperY = -1;

        /** @type {boolean} 마우스, 터치 다운 여부 */
        this.isDown = false;

        /** @type {Date} 마우스, 터치 다운한 시간 new Date() */
        this.downTime = null;

        /** @type {array} 슬라이드 아이템 [img src = string] */
        this.data = [];

        /** @type {number} 슬라이드 최대 인덱스 번호 */
        this.maxIdx = -1;

        /** @type {number} 슬라이드 이동 속도 */
        this.transition = 0.25;

        /** @type {HTMLElement} 다음 슬라이드 이동 버튼 */
        this.btnNext = null;

        /** @type {HTMLElement} 이전 슬라이드 이동 버튼 */
        this.btnPrev = null;

        this.init()
    }

    init() {

        this.element.style.overflow = "hidden";

        this.wrapper = this.createWrapper();
        this.slideInner = this.createSlideInner();

        this.wrapper.prepend(this.slideInner);

        /** @type {Event} 마우스, 터치 다운 이벤트 바인딩 */
        const eventDown = this.eventDown.bind(this);

        /** @type {Event} 마우스, 터치 무브 이벤트 바인딩 */
        const eventMove = this.eventMove.bind(this);

        /** @type {Event} 마우스, 터치 업 이벤트 바인딩 */
        const eventUp = this.eventUp.bind(this);

        this.wrapper.addEventListener("mousedown",eventDown,{passive: true});
        this.wrapper.addEventListener("mousemove",eventMove,{passive: true});
        this.wrapper.addEventListener("mouseup",eventUp,{passive: true});

        this.wrapper.addEventListener("touchstart",eventDown,{passive: true});
        this.wrapper.addEventListener("touchmove",eventMove,{passive: true});
        this.wrapper.addEventListener("touchend",eventUp,{passive: true});

        this.element.append(this.wrapper);

        this.nullItem()
    }

    /** 슬라이드 아이템 / 페이지네이션 아이템을 추가함 */
    createItem(files){

        const src = URL.createObjectURL(files);
        const alt = files.name;

        this.data.push(files);

        this.maxIdx = this.data.length-1;

        const slideItem = this.createSlideItem(src, alt);

        this.slideInner.append(slideItem);

        if(document.querySelector("[data-slide=null]")) {
            document.querySelector("[data-slide=null]").remove();
        }

        if(this.data.length > 1) {

            /** 페이지네이션 버튼 생성 및 설정 */
            this.setPagination(); 

            /** 다음, 이전 슬라이드 이동 버튼이 없을때 */
            if(!this.btnNext && !this.btnPrev) {
                this.setSlideNavi();
            }

            /** 다음, 이전 슬라이드 이동 버튼이 있을때 활성화 / 비활성화 설정 */
            this.setSlideNaviActive();
        }
        else {

        }
    }

    /**
     * 슬라이드 이동할 태그, 페이지네이션 태그 를 담는 부모 태그
     * @returns {HTMLElement} 
     */
    createWrapper(){
        const wrapper = document.createElement("div");

        wrapper.dataset.slide = "wrapper";

        wrapper.style.width = "100%";
        wrapper.style.height = "100%";

        return wrapper
    }

    /** 
     * 슬라이드 이동할 태그
     * @returns {HTMLElement}
     */
    createSlideInner(){
        const inner = document.createElement("ul");

        inner.dataset.slide = "inner";

        inner.style.position = "relative";
        inner.style.left = 0;
        inner.style.display = "flex";
        inner.style.width =  "100%";
        inner.style.height = "100%";   
        inner.style.transition = `${this.transition}s ease-in-out`;

        return inner
    }

    /**
     * 페이지네이션 inner 생성
     * @returns {HTMLElement} 페이지네이션 inner <ol>
     */
    createPaginationInner(){
        const inner = document.createElement("ol");

        const slideInner = this.getSlideInnerRect();
    
        inner.dataset.slide = "paginationInner";

        inner.style.position = "absolute";
        inner.style.bottom = `${slideInner["height"] / 20}px`;
        inner.style.left = 0;
        inner.style.display = "flex";
        inner.style.justifyContent = "center";
        inner.style.alignItems = "center";
        inner.style.width =  "100%";   
        inner.style.height = "10px";

        return inner;
    }

    /**
     * 슬라이드 아이템 생성
     * @param {string} src 
     * @param {string} alt 대체 텍스트 (파일 이름)
     * @returns {HTMLElement} <img>
     */
    createSlideItem(src, alt){
        if(!src) return console.log(`${src} item 없음` );

        const li = document.createElement("li");

        li.style.position = "relative";
        li.style.flexShrink = 0;
        li.style.display = "flex";
        li.style.justifyContent = "center";
        li.style.alignItems = "center";
        li.style.width = "100%";
        li.style.height = "100%";

        // li.dataset.slide = this.maxIdx;

        const btn = this.createItemDeleteBtn(alt);

        const img = document.createElement("img");

        img.src = src;
        img.alt = `${alt} 슬라이드 이미지`;

        img.style.width = "80%";
        img.style.height = "80%";

        img.style.pointerEvents = "none";
        img.style.userSelect = "none";


        li.prepend(btn);
        li.append(img);

        return li
    }

    /**
     * 페이지 네이션 생성 및 활성화
     */
    setPagination(){

        if(!this.paginationInner) {
            this.paginationInner = this.createPaginationInner();
            this.wrapper.append(this.paginationInner);
        }

        this.paginationInner.innerHTML = "";

        if(this.data.length <= 0) return;

        /** @type {array} 현재 업로드 된 슬라이드 데이터를 담은 배열 [files] */
        let data = this.data;

        for(let i = 0; i < data.length; i++){
            const li = document.createElement("li");

            li.style.display = "block";
            li.style.width = "10px";
            li.style.height = "10px";
    
            if(i > 0) li.style.marginLeft = "10px";
    
            const btn = document.createElement("button");
    
            btn.style.display = "block"
            btn.style.textAlign = "center";
            btn.style.lineHeight = "25px";
            btn.style.width = "100%";
            btn.style.height = "100%";
            btn.style.border = "1px solid #000";
            btn.style.borderRadius = "100%";
            btn.dataset.pagination = i; 

            btn.addEventListener("click",(e) => {
                const self = e.currentTarget;

                const idx = Number(self.dataset.pagination);

                this.paginationActive(idx);
                this.paginationMove(idx);
            })

            li.append(btn);

            this.paginationInner.append(li)

            this.paginationActive(this.slideIdx);
        }
    }

    /**
     * 슬라이드 버튼 생성
     */
    setSlideNavi(){

        /** @type {HTMLElement} 이전 슬라이드 이동 버튼 */
        const btnPrev = document.createElement("button");

        /** @type {HTMLElement} 다음 슬라이드 이동 버튼 */
        const btnNext = btnPrev.cloneNode();
        
        btnNext.innerHTML = ">";
        btnPrev.innerHTML = "<";

        btnNext.dataset.slideNavi = "next";
        btnPrev.dataset.slideNavi = "prev";

        this.btnNext = this.btnNaviSetCss(btnNext);
        this.btnPrev = this.btnNaviSetCss(btnPrev, true);

        const eventCallback = this.btnNaviEvent.bind(this);

        this.btnNext.addEventListener("click",eventCallback);
        this.btnPrev.addEventListener("click",eventCallback);
        
        this.wrapper.append(this.btnNext);
        this.wrapper.append(this.btnPrev);
    }

    /**
     * 다음, 이전 슬라이드 이동 버튼 이벤트
     * @param {MouseEvent} e 
     */
    btnNaviEvent(e) {
        const self = e.currentTarget;
        
        const type = self.dataset.slideNavi;
        
        if(type === "next") {
            if(this.slideIdx < this.maxIdx) {
                this.slideIdx+=1;
                this.currLeft-=100;
            }
        }
        else if(type === "prev") {
            if(0 < this.slideIdx) {
                this.slideIdx-=1;
                this.currLeft+=100;
            }
            else {
                this.slideIdx = 0;
            }
        }
        
        this.setPagination();
        this.setSlideNaviActive();

        this.slideMove(this.currLeft);
    }

    /**
     * 슬라이드 이동 버튼 활성화 / 비활성화
     */
    setSlideNaviActive(){
        document.querySelectorAll("[data-slide-navi]").forEach(el => {
            const type = el.dataset.slideNavi;

            /** 첫 슬라이드일 경우 */
            if(this.slideIdx === 0) {
                if(type === "prev") el.style.color = "#e2e2e2";
                else el.style.color = "#000000";
            }
            /** 마지막 슬라이드일 경우 */
            else if(this.slideIdx === (this.data.length-1)){
                if(type === "next") el.style.color = "#e2e2e2";
                else el.style.color = "#000000"
            }
            /** 이전, 다음 버튼 둘다 활성화 */
            else {
                el.style.color = "#000000";
            }
        })
    }

    /**
     * 다음, 이전 이동 버튼 css 설정
     * @param {HTMLElement} element <button>
     * @param {boolean} prev 
     * true : 이전 슬라이드 이동 버튼 css 설정, false : 다음 슬라이드 이동 버튼 css 설정
     */
    btnNaviSetCss(btn,prev){

        const innerWidth = this.getSlideInnerRect()["width"];

        btn.style["position"] = "absolute";
        btn.style["top"] = "50%";
        btn.style[prev ? "left" : "right"] = `${(innerWidth/20)/2}px`;
        btn.style["transform"] = "translateY(-50%)";
        btn.style["display"] = "block";
        btn.style["fontSize"] = "30px";

        return btn
    }

    /**
     * 페이지 네이션 버튼 활성화 / 비활성화
     * @param {number} number this.slideIdx
     */
    paginationActive(number){
        const btnPagination = this.element.querySelectorAll("[data-pagination]");

        btnPagination.forEach(el => {
            const idx = Number(el.dataset.pagination);

            el.style.backgroundColor = idx === number ? "#000" : "";
            el.style.color = idx === number ? "#fff" : "#000";
        });
    }

    /**
     * 페이지네이션 버튼 클릭 이동
     * @param {*} i 
     */
    paginationMove(i){

        let left;
        switch (i) {
            case 0 : left = 0; break;
            default : left = -i * 100; break;
        }

        this.slideMove(left);
    }

    /**
     * 슬라이드 이동
     * @param {number} left 
     */
    slideMove(left){
        this.slideInner.style.left = `${left}%`;
    }

    /**
     * 슬라이드 삭제 버튼 생성
     * @param {string} name 파일 이름 
     */
    createItemDeleteBtn(name){
        const btn = document.createElement("button");

        btn.value = name;

        btn.style.position = "absolute";
        btn.style.top = 0;
        btn.style.right = 0;

        btn.style.display = "block";
        btn.style.width = "15px";
        btn.style.height = "15px";
        btn.style.backgroundColor = "#f0f"  ;
        
        const callback = this.btnDeleteEvent.bind(this);

        btn.addEventListener("click", callback);
        
        return btn
    }

    /**
     * 슬라이드 아이템 삭제 버튼 이벤트
     * @param {MouseEvent} e 
     */
    btnDeleteEvent(e){
    
        const self = e.currentTarget;

        const value = self.value;

        const findIdx = this.data.findIndex(el => el.name === value);
        
        this.data.splice(findIdx, 1);

        self.parentElement.remove();
        
        if(this.currLeft < 0) this.currLeft+=100;

        this.slideInner.style.transition = "none";
        
        this.slideMove(this.currLeft);

        this.maxIdx = (this.maxIdx - 1) < 0 ? 0 : this.maxIdx - 1;
        this.slideIdx = (this.slideIdx - 1) < 0 ? 0 : this.slideIdx - 1;
        
        if(this.maxIdx === 0) this.naviReset();

        if(this.data.length === 0) return this.nullItem();

        this.setPagination();

        this.setSlideNaviActive();

        let timer = setTimeout(() => {
            this.slideInner.style.transition = "0.25s ease";    

            clearTimeout(timer);
            timer = null;
        }, 0);
    }

    /**
     * 페이지네이션, 다음, 이전화 버튼 삭제
     */
    naviReset(){
        document.querySelectorAll("[data-slide-navi]").forEach(el => el.remove());

        this.btnNext = null;
        this.btnPrev = null;

        this.paginationInner.remove();
        this.paginationInner = null;
    }

    /**
     * 등록한 사진이 없을시 UI 생성
     */
    nullItem(){

        let li = document.createElement("li");

        let temp = 
        `
            <svg height="32" id="icon" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><defs><style>.cls-1{fill:none;}</style></defs><title/><path d="M30,3.4141,28.5859,2,2,28.5859,3.4141,30l2-2H26a2.0027,2.0027,0,0,0,2-2V5.4141ZM26,26H7.4141l7.7929-7.793,2.3788,2.3787a2,2,0,0,0,2.8284,0L22,19l4,3.9973Zm0-5.8318-2.5858-2.5859a2,2,0,0,0-2.8284,0L19,19.1682l-2.377-2.3771L26,7.4141Z"/><path d="M6,22V19l5-4.9966,1.3733,1.3733,1.4159-1.416-1.375-1.375a2,2,0,0,0-2.8284,0L6,16.1716V6H22V4H6A2.002,2.002,0,0,0,4,6V22Z"/><rect class="cls-1" data-name="&lt;Transparent Rectangle&gt;" height="32" id="_Transparent_Rectangle_" width="32"/></svg>
        `;

        li.innerHTML = temp;

        li.style.width = "100%";
        li.style.height = "100%";

        li.querySelector("svg").style.width = "100%";
        li.querySelector("svg").style.height = "100%";

        li.dataset.slide = "null";

        this.slideInner.append(li);
    }

    /** 슬라이드 inner의 위치, 크기 상대값을 리턴함
     * @returns {getBoundingClientRect}
     */
    getSlideInnerRect(){
        return this.slideInner.getBoundingClientRect();
    }

    /** 마우스, 터치 다운 이벤트 */
    eventDown(){
        this.isDown = true;

        this.downTime = new Date();

        this.slideInner.style.transition = `none`;
    }

    /**
     * 마우스, 터치 좌표 이벤트를 리턴함
     * @param {MouseEvent} e 
     * @returns {object} {x : number, y : number}
     */
    eventParam(e) {

        let x = undefined;
        let y = undefined;

        if (e.touches && e.touches.length > 0){
            x = e.touches[0].pageX;
            y = e.touches[0].pageY;
        }
        if (e.changedTouches && e.changedTouches.length > 0){
            x = e.changedTouches[0].pageX;
            y = e.changedTouches[0].pageY;
        }
        if (x === undefined){
            x = e.pageX;
        }
        if (y === undefined){
            y = e.pageY;
        }

        return {
            x : x,
            y : y
        }
    }

    /**
     * 마우스, 터치 무브 이벤트
     * @param {MouseEvent} e 
     */
    eventMove(e){
        
        if(!this.isDown) return

        const { x } = this.eventParam(e);

        if(this.prevX !== null) {
            if(x < this.prevX) {
                if(this.left >= -20) this.isDrirection = "left";
            }
            else if(x > this.prevX) {
                if(this.left <= 20) this.isDrirection = "right";
            }
        }

        this.prevX = x;
    }

    /**
     * 마우스, 터치 업 이벤트
     */
    eventUp(){

        this.slideInner.style.transition = `${this.transition}s ease-in-out`;

        let downTime = new Date() - this.downTime;

        if(downTime < 300) {

            if(this.isDrirection === "left") {
                if(this.slideIdx < this.maxIdx) {
                    this.slideIdx+=1;
                    this.currLeft-=100;
                }
                else {
                    this.slideIdx = this.maxIdx;
                }
            }
            else if(this.isDrirection === "right") {
                if(0 < this.slideIdx) {
                    this.slideIdx-=1;
                    this.currLeft+=100;
                }
                else {
                    this.slideIdx = 0;
                }
            }

            this.slideMove(this.currLeft)

            if(this.data.length > 1) {
                this.paginationActive(this.slideIdx);

                this.setSlideNaviActive()
            }
        }

        this.isDrirection = "";

        this.isDown = false;

        this.prevX = null;

        this.left = 0;
        
    }
}