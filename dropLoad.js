/**
 * Created by ltq on 2019/5/23.
 * param: 滑动底部加载数据
 */
;(function ($) {
    $.fn.loadDrop = function(options){
        return new MyDropLoad(this, options);
    };
    var MyDropLoad = function(element, options){
        var me = this;
        me.$element = element;
        // loading状态
        me.loading = false;
        // 是否有数据
        me.isData = true
        // 是否锁定
        me.isLockUp = false;
        me.init(options);
    };
    // 初始化
    MyDropLoad.prototype.init = function(options){
        var me = this,headerHgt=0;
        me.opts = $.extend(true, {}, {
            $element:'',
            loadDownFn : ''  // 下方function
        }, options);
        // 加载下方
        me.opts.$element.on('scroll',function(){
            // 此处解决div滚动触发外层滚动溢出机制 导致页面卡住 确保滚动条scrollTop不等于0 以及触碰到底部
            if(me.opts.$element.scrollTop() == 0){
                // 保证往回滚动不触发溢出机制
                me.opts.$element[0].scrollTop = 1
            }
            if(!me.isData){
                computeHeight(me);
            }
            srollHander(me.opts.$element,me)
        });
        // 窗口调整 重新计算高度 -webkit-overflow-scrolling 解决ios卡顿的问题
        me.opts.$element.css("-webkit-overflow-scrolling","touch") 
        me.opts.$element.css("overflow-y","scroll")
        me.opts.$element[0].style.height =  window.innerHeight + 'px'
        $(window).on('resize',function(){
            clearTimeout(me.timer);
            me.timer = setTimeout(function(){
                // 操作高度
                me.opts.$element[0].style.height =  window.innerHeight + 'px'
            },150);

        });
        fnAutoLoad(me);
    }
    // 锁定
    MyDropLoad.prototype.lock = function(){
        var me = this;
       me.isLockUp = true

    };
    MyDropLoad.prototype.unLock = function(){
        var me = this;
        me.isLockUp = false

    };
    // 无数据
    MyDropLoad.prototype.noData = function(flag){
        var me = this;
        if(flag === undefined || flag == true){
            me.isData = false;
            // 计算高度
            computeHeight(me);
        }else if(flag == false){
            me.isData = true;
        }
    };
    // 重置
    MyDropLoad.prototype.resetload = function () {
        var me = this
        if(me.isData){
            // 加载区修改样式
            fnAutoLoad(me);
        }else{
            // 如果没数据
        }
    }
    function loadDownFn(me) {
         me.opts.loadDownFn(me)
        if(!me.isData){
            computeHeight(me);
        }
     }

     function computeHeight(me) {
         // 计算所有子元素高度和
         var totalHeight = 0;
         var childArr = me.opts.$element.children();
         for(var i = 0; i < childArr.length ; i++){
             if(!($(childArr[i]).is(":hidden"))){
                 // div内总高度
                 totalHeight += $(childArr[i]).innerHeight()
             }
         }
         if(Math.ceil(me.opts.$element.scrollTop()  + me.opts.$element.height()) >= totalHeight){
             // 保证不触碰底部
             me.opts.$element[0].scrollTop = totalHeight - me.opts.$element.height() - 1
         }
     }
    // 如果文档高度不大于窗口高度，数据较少，自动加载下方数据
    function fnAutoLoad(me){
        if(me.opts.loadDownFn != ''){
            if((me.opts.$element.children().innerHeight()  <= me.opts.$element.innerHeight())){
                loadDownFn(me);
            }
        }
    }
    //滚动条事件 app是被滚动的标签的ID，可以是div,table,table里面的tbody等
    var  srollHander = function(eleScroll,me){
        //滚动条位置
        var scrollTop = eleScroll.scrollTop();
        //可视窗口的高度
        var viewportHeight = eleScroll.height();
        //整个页面可以滚动的高度
        var scrollHeight = eleScroll[0].scrollHeight;
        // 获取子内容的高度
        var childHeight = eleScroll.children().height();
        //“如果滚动条的位置”+“可视窗口的高度”=“整个页面可以滚动的高度”，那么就调用相应的函数加载数据 || childHeight < viewportHeight
        if(Math.ceil(scrollTop+viewportHeight) >= scrollHeight && !me.isLockUp && me.isData){
            // 进入之后加锁
            me.lock();
            loadDownFn(me);

        }
    }
})(window.Zepto || window.jQuery)