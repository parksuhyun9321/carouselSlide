# carouselSlide ver. 2

20240310 psh
 
사이즈가 지정된 html 태그를 파라미터로 넣어서 new 생성 

pc, 모바일 사용 가능 

터치/마우스 드래그 이동, 페이지네이션, 슬라이드 삭제 

무한 반복 X 

ex) 
    <style>
      #section {
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%,-50%); 
            display: block; 
            width: 500px;
            height: 500px; 
            border: 1px solid #000;
      }
    </style>
    <script>
      const section = <section id="section"></section>
      new CarouselSlide(section)
    </script>
   


20240314 psh 

 - 슬라이드 아이템 삭제후 한개만 남을시 페이지네이션 버튼 삭제 안되는 이슈 수정

 - 슬라이드 아이템 삭제 버튼 UI 수정