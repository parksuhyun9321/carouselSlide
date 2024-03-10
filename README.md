# carouselSlide

20240310 psh
 
사이즈가 지정된 html 태그를 파라미터로 넣어서 new 생성 

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
    const section = <section id="section"></section>
    new CarouselSlide(section)
