var loadOptions = {
    container: ".main",
    slow: true,//开启缓慢显示进度，默认 false
    maxWidth: 1334,
    slowtime: 10,//缓慢显示进度的时间间隔，默认 50
    maxRadio: 0.74,
    minRadio: 0.56,
    setRem: true,
    setWidth: true,
    autoHeight: false
};


$('.main').loading({
    onload: function (pre) {
        $(".loading p").text(pre + "%");
        //i++;console.log(i)
    },
    complete: function (a) {
        $(".loading").removeClass("cur");
        $('.main img').css('opacity',1);
    }
})