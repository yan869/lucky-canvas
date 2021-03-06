'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var Lucky = /** @class */ (function () {
    function Lucky(el) {
        this.htmlFontSize = 16;
        this.dpr = 1;
        this.subs = {};
        this.setDpr();
        this.setHTMLFontSize();
        this.resetArrayPropo();
        this.box = typeof el === 'string'
            ? document.querySelector(el) : el;
        this.canvas = document.createElement('canvas');
        this.box.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    }
    /**
     * 设备像素比
     */
    Lucky.prototype.setDpr = function () {
        window.dpr = this.dpr = (window.devicePixelRatio || 2) * 1.3;
    };
    /**
     * 根标签的字体大小
     */
    Lucky.prototype.setHTMLFontSize = function () {
        this.htmlFontSize = +getComputedStyle(document.documentElement).fontSize.slice(0, -2);
    };
    /**
     * 根据 dpr 缩放 canvas 并处理位移
     * @param canvas 画布
     * @param width 将要等比缩放的宽
     * @param height 将要等比缩放的高
     */
    Lucky.prototype.optimizeClarity = function (canvas, width, height) {
        var dpr = this.dpr;
        var compute = function (len) {
            return (len * dpr - len) / (len * dpr) * (dpr / 2) * 100;
        };
        canvas.style.transform = "scale(" + 1 / dpr + ") translate(\n      " + -compute(width) + "%, " + -compute(height) + "%\n    )";
    };
    /**
     * 转换单位
     * @param { string } value 将要转换的值
     * @param config
     * @return { number } 返回新的字符串
     */
    Lucky.prototype.changeUnits = function (value, _a) {
        var _this_1 = this;
        var _b = _a.denominator, denominator = _b === void 0 ? 1 : _b, _c = _a.clean, clean = _c === void 0 ? false : _c;
        return Number(value.replace(/^(\-*[0-9.]*)([a-z%]*)$/, function (value, num, unit) {
            switch (unit) {
                case '%':
                    num *= (denominator / 100);
                    break;
                case 'px':
                    num *= 1;
                    break;
                case 'rem':
                    num *= _this_1.htmlFontSize;
                    break;
                default:
                    num *= 1;
                    break;
            }
            return clean || unit === '%' ? num : num * _this_1.dpr;
        }));
    };
    /**
     * 更新数据并重新绘制 canvas 画布
     */
    Lucky.prototype.draw = function () { };
    /**
     * 数据劫持
     * @param obj 将要处理的数据
     */
    Lucky.prototype.observer = function (data) {
        var _this_1 = this;
        if (!data || typeof data !== 'object')
            return;
        Object.keys(data).forEach(function (key) {
            _this_1.defineReactive(data, key, data[key]);
        });
    };
    /**
     * 重写 setter 和 getter
     * @param obj 数据
     * @param key 属性
     * @param val 值
     */
    Lucky.prototype.defineReactive = function (data, key, value) {
        var _this_1 = this;
        this.observer(value);
        Object.defineProperty(data, key, {
            get: function () {
                return value;
            },
            set: function (newVal) {
                var oldVal = value;
                if (newVal === value)
                    return;
                value = newVal;
                _this_1.observer(value);
                if (_this_1.subs[key])
                    _this_1.subs[key].call(_this_1, value, oldVal);
                _this_1.draw();
            }
        });
    };
    /**
     * 添加一个新的响应式数据
     * @param data 数据
     * @param key 属性
     * @param value 新值
     */
    Lucky.prototype.$set = function (data, key, value) {
        if (!data || typeof data !== 'object')
            return;
        this.defineReactive(data, key, value);
    };
    /**
     * 添加一个属性计算
     * @param data 源数据
     * @param key 属性名
     * @param callback 回调函数
     */
    Lucky.prototype.$computed = function (data, key, callback) {
        var _this_1 = this;
        Object.defineProperty(data, key, {
            get: function () {
                return callback.call(_this_1);
            }
        });
    };
    /**
     * 添加一个观察者
     * @param key 属性名
     * @param callback 回调函数
     */
    Lucky.prototype.$watch = function (key, callback) {
        this.subs[key] = callback;
    };
    /**
     * 重写数组的原型方法
     */
    Lucky.prototype.resetArrayPropo = function () {
        var _this = this;
        var oldArrayProto = Array.prototype;
        var newArrayProto = Object.create(oldArrayProto);
        var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'splice', 'reverse'];
        methods.forEach(function (name) {
            newArrayProto[name] = function () {
                var _a;
                _this.draw();
                (_a = oldArrayProto[name]).call.apply(_a, __spreadArrays([this], Array.from(arguments)));
            };
        });
    };
    return Lucky;
}());

/**
 * 判断是否是期望的类型
 * @param { any } param 将要判断的变量
 * @param { ...string } types 期望的类型
 * @return { boolean } 返回期望是否正确
 */
var isExpectType = function (param) {
    var types = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        types[_i - 1] = arguments[_i];
    }
    return types.some(function (type) { return Object.prototype.toString.call(param).slice(8, -1).toLowerCase() === type; });
};
/**
 * 移除\n
 * @param { string } str 将要处理的字符串
 * @return { string } 返回新的字符串
 */
var removeEnter = function (str) {
    return [].filter.call(str, function (s) { return s !== '\n'; }).join('');
};
/**
 * 参数校验器
 * @param data 将要校验的参数
 * @param params 校验规则
 * @param msg 警告信息
 * @return { boolean } 校验成功返回true, 反之false
 */
// export const paramsValidator = (data: any, params = {}, msg = '') => {
//   if (isExpectType(data, 'object')) data = [data]
//   return data.every((item, index) => {
//     for (let key in params) {
//       if (params[key] === 1 && !item.hasOwnProperty(key)) {
//         return !!console.error(`参数 ${msg}[${index}] 缺少 ${key} 属性`)
//       }
//       else if (isExpectType(params[key], 'object') && item[key]) {
//         if (!paramsValidator(
//           item[key], params[key], msg ? `${msg}[${index}].${key}` : key
//         )) return false
//       }
//     }
//     return true
//   })
// }
/**
 * 通过padding计算
 * @return { object } block 边框信息
 */
var computePadding = function (block) {
    var padding = block.padding.replace(/px/g, '').split(' ').map(function (n) { return ~~n; }) || [0], paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0;
    switch (padding.length) {
        case 1:
            paddingTop = paddingBottom = paddingLeft = paddingRight = padding[0];
            break;
        case 2:
            paddingTop = paddingBottom = padding[0];
            paddingLeft = paddingRight = padding[1];
            break;
        case 3:
            paddingTop = padding[0];
            paddingLeft = paddingRight = padding[1];
            paddingBottom = padding[2];
            break;
        default:
            paddingTop = padding[0];
            paddingBottom = padding[1];
            paddingLeft = padding[2];
            paddingRight = padding[3];
    }
    // 检查是否单独传入值, 并且不是0
    var res = { paddingTop: paddingTop, paddingBottom: paddingBottom, paddingLeft: paddingLeft, paddingRight: paddingRight };
    for (var key in res) {
        // 是否含有这个属性, 并且是数字或字符串
        res[key] = block.hasOwnProperty(key) && isExpectType(block[key], 'string', 'number')
            ? ~~String(block[key]).replace(/px/g, '')
            : res[key];
    }
    return [paddingTop, paddingBottom, paddingLeft, paddingRight];
};

/**
 * 转换为运算角度
 * @param { number } deg 数学角度
 * @return { number } 运算角度
 */
var getAngle = function (deg) {
    return Math.PI / 180 * deg;
};
/**
 * 根据角度计算圆上的点
 * @param { number } deg 运算角度
 * @param { number } r 半径
 * @return { Array<number> } 坐标[x, y]
 */
var getArcPointerByDeg = function (deg, r) {
    return [+(Math.cos(deg) * r).toFixed(8), +(Math.sin(deg) * r).toFixed(8)];
};
/**
 * 根据点计算切线方程
 * @param { number } x 横坐标
 * @param { number } y 纵坐标
 * @return { Array<number> } [斜率, 常数]
 */
var getTangentByPointer = function (x, y) {
    var k = -x / y;
    var b = -k * x + y;
    return [k, b];
};
// 根据三点画圆弧
var drawRadian = function (ctx, r, start, end, direction) {
    var _a;
    if (direction === void 0) { direction = true; }
    if (Math.abs(end - start).toFixed(8) >= getAngle(180).toFixed(8)) {
        var middle = (end + start) / 2;
        if (direction) {
            drawRadian(ctx, r, start, middle, direction);
            drawRadian(ctx, r, middle, end, direction);
        }
        else {
            drawRadian(ctx, r, middle, end, direction);
            drawRadian(ctx, r, start, middle, direction);
        }
        return false;
    }
    if (!direction)
        _a = [end, start], start = _a[0], end = _a[1];
    var _b = getArcPointerByDeg(start, r), x1 = _b[0], y1 = _b[1];
    var _c = getArcPointerByDeg(end, r), x2 = _c[0], y2 = _c[1];
    var _d = getTangentByPointer(x1, y1), k1 = _d[0], b1 = _d[1];
    var _e = getTangentByPointer(x2, y2), k2 = _e[0], b2 = _e[1];
    var x0 = (b2 - b1) / (k1 - k2);
    var y0 = (k2 * b1 - k1 * b2) / (k2 - k1);
    if (isNaN(x0)) {
        Math.abs(x1) === +r.toFixed(8) && (x0 = x1);
        Math.abs(x2) === +r.toFixed(8) && (x0 = x2);
    }
    if (k1 === Infinity || k1 === -Infinity) {
        y0 = k2 * x0 + b2;
    }
    else if (k2 === Infinity || k2 === -Infinity) {
        y0 = k1 * x0 + b1;
    }
    ctx.lineTo(x1, y1);
    ctx.arcTo(x0, y0, x2, y2, r);
};
// 绘制扇形
var drawSector = function (ctx, minRadius, maxRadius, start, end, gutter, background) {
    if (!minRadius)
        minRadius = gutter;
    var maxGutter = getAngle(90 / Math.PI / maxRadius * gutter);
    var minGutter = getAngle(90 / Math.PI / minRadius * gutter);
    var maxStart = start + maxGutter;
    var maxEnd = end - maxGutter;
    var minStart = start + minGutter;
    var minEnd = end - minGutter;
    ctx.beginPath();
    ctx.fillStyle = background;
    ctx.moveTo.apply(ctx, getArcPointerByDeg(maxStart, maxRadius));
    drawRadian(ctx, maxRadius, maxStart, maxEnd, true);
    // 如果 getter 比按钮短就绘制圆弧, 反之计算新的坐标点
    if (minEnd > minStart)
        drawRadian(ctx, minRadius, minStart, minEnd, false);
    else
        ctx.lineTo.apply(ctx, getArcPointerByDeg((start + end) / 2, gutter / 2 / Math.abs(Math.sin((start - end) / 2))));
    ctx.closePath();
    ctx.fill();
};
// 绘制圆角矩形
var drawRoundRect = function (ctx, x, y, w, h, r, color) {
    var min = Math.min(w, h);
    if (r > min / 2)
        r = min / 2;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
    ctx.fill();
};
/**
 * 创建线性渐变色
 */
var getLinearGradient = function (ctx, x, y, w, h, background) {
    var context = /linear-gradient\((.+)\)/.exec(background)[1]
        .split(',') // 根据逗号分割
        .map(function (text) { return text.trim(); }); // 去除两边空格
    var deg = context.shift(), direction = [0, 0, 0, 0];
    // 通过起始点和角度计算渐变终点的坐标点, 这里感谢泽宇大神提醒我使用勾股定理....
    if (deg.includes('deg')) {
        deg = deg.slice(0, -3) % 360;
        // 根据4个象限定义起点坐标, 根据45度划分8个区域计算终点坐标
        var getLenOfTanDeg = function (deg) { return Math.tan(deg / 180 * Math.PI); };
        if (deg >= 0 && deg < 45)
            direction = [x, y + h, x + w, y + h - w * getLenOfTanDeg(deg - 0)];
        else if (deg >= 45 && deg < 90)
            direction = [x, y + h, (x + w) - h * getLenOfTanDeg(deg - 45), y];
        else if (deg >= 90 && deg < 135)
            direction = [x + w, y + h, (x + w) - h * getLenOfTanDeg(deg - 90), y];
        else if (deg >= 135 && deg < 180)
            direction = [x + w, y + h, x, y + w * getLenOfTanDeg(deg - 135)];
        else if (deg >= 180 && deg < 225)
            direction = [x + w, y, x, y + w * getLenOfTanDeg(deg - 180)];
        else if (deg >= 225 && deg < 270)
            direction = [x + w, y, x + h * getLenOfTanDeg(deg - 225), y + h];
        else if (deg >= 270 && deg < 315)
            direction = [x, y, x + h * getLenOfTanDeg(deg - 270), y + h];
        else if (deg >= 315 && deg < 360)
            direction = [x, y, x + w, y + h - w * getLenOfTanDeg(deg - 315)];
    }
    // 创建四个简单的方向坐标
    else if (deg.includes('top'))
        direction = [x, y + h, x, y];
    else if (deg.includes('bottom'))
        direction = [x, y, x, y + h];
    else if (deg.includes('left'))
        direction = [x + w, y, x, y];
    else if (deg.includes('right'))
        direction = [x, y, x + w, y];
    // 创建线性渐变必须使用整数坐标
    var gradient = ctx.createLinearGradient.apply(ctx, direction.map(function (n) { return n >> 0; }));
    // 这里后期重构, 先用any代替
    return context.reduce(function (gradient, item, index) {
        var info = item.split(' ');
        if (info.length === 1)
            gradient.addColorStop(index, info[0]);
        else if (info.length === 2)
            gradient.addColorStop.apply(gradient, info);
        return gradient;
    }, gradient);
};

/**
 * 缓动函数
 * t: current time（当前时间）
 * b: beginning value（初始值）
 * c: change in value（变化量）
 * d: duration（持续时间）
 *
 * 感谢张鑫旭大佬 https://github.com/zhangxinxu/Tween
 */
// 二次方的缓动
var quad = {
    easeIn: function (t, b, c, d) {
        if (t >= d)
            t = d;
        return c * (t /= d) * t + b;
    },
    easeOut: function (t, b, c, d) {
        if (t >= d)
            t = d;
        return -c * (t /= d) * (t - 2) + b;
    }
};

var LuckyWheel = /** @class */ (function (_super) {
    __extends(LuckyWheel, _super);
    /**
     * 大转盘构造器
     * @param el 元素标识
     * @param data 抽奖配置项
     */
    function LuckyWheel(el, data) {
        if (data === void 0) { data = {}; }
        var _this = _super.call(this, el) || this;
        _this.blocks = [];
        _this.prizes = [];
        _this.buttons = [];
        _this.defaultConfig = {};
        _this._defaultConfig = {
            gutter: '0px',
            offsetDegree: 0,
            speed: 20,
            accelerationTime: 2500,
            decelerationTime: 2500,
        };
        _this.defaultStyle = {};
        _this._defaultStyle = {
            fontSize: '18px',
            fontColor: '#000',
            fontStyle: 'microsoft yahei ui,microsoft yahei,simsun,sans-serif',
            fontWeight: '400',
            lineHeight: '',
            background: '#fff',
            wordWrap: true,
            lengthLimit: '90%',
        };
        _this.Radius = 0; // 大转盘半径
        _this.prizeRadius = 0; // 奖品区域半径
        _this.prizeDeg = 0; // 奖品数学角度
        _this.prizeRadian = 0; // 奖品运算角度
        _this.rotateDeg = 0; // 转盘旋转角度
        _this.maxBtnRadius = 0; // 最大按钮半径
        _this.startTime = 0; // 开始时间戳
        _this.endTime = 0; // 停止时间戳
        _this.stopDeg = 0; // 刻舟求剑
        _this.endDeg = 0; // 停止角度
        _this.animationId = 0; // 帧动画id
        _this.FPS = 16.6; // 屏幕刷新率
        _this.prizeImgs = [[]];
        _this.btnImgs = [[]];
        _this.initData(data);
        _this.initComputed();
        _this.initWatch();
        // 收集首次渲染的图片
        var willUpdate = [[]];
        _this.prizes && (willUpdate = _this.prizes.map(function (prize) { return prize.imgs; }));
        _this.buttons && (willUpdate.push.apply(willUpdate, _this.buttons.map(function (btn) { return btn.imgs; })));
        _this.init(willUpdate);
        return _this;
    }
    /**
     * 初始化数据
     * @param data
     */
    LuckyWheel.prototype.initData = function (data) {
        this.$set(this, 'blocks', data.blocks || []);
        this.$set(this, 'prizes', data.prizes || []);
        this.$set(this, 'buttons', data.buttons || []);
        this.$set(this, 'defaultConfig', data.defaultConfig || {});
        this.$set(this, 'defaultStyle', data.defaultStyle || {});
        this.$set(this, 'startCallback', data.start);
        this.$set(this, 'endCallback', data.end);
    };
    /**
     * 初始化属性计算
     */
    LuckyWheel.prototype.initComputed = function () {
        var _this = this;
        // 默认配置
        this.$computed(this, '_defaultConfig', function () {
            var config = __assign({ gutter: '0px', offsetDegree: 0, speed: 20, accelerationTime: 2500, decelerationTime: 2500 }, _this.defaultConfig);
            return config;
        });
        // 默认样式
        this.$computed(this, '_defaultStyle', function () {
            var style = __assign({ fontSize: '18px', fontColor: '#000', fontStyle: 'microsoft yahei ui,microsoft yahei,simsun,sans-serif', fontWeight: '400', background: '#fff', wordWrap: true, lengthLimit: '90%' }, _this.defaultStyle);
            return style;
        });
    };
    /**
     * 初始化观察者
     */
    LuckyWheel.prototype.initWatch = function () {
        var _this = this;
        // 观察奖品数据的变化
        this.$watch('prizes', function (newData, oldData) {
            var willUpdate = [];
            // 首次渲染时oldData为undefined
            if (!oldData)
                willUpdate = newData.map(function (prize) { return prize.imgs; });
            // 此时新值一定存在
            else if (newData)
                newData.forEach(function (newPrize, prizeIndex) {
                    var prizeImgs = [];
                    var oldPrize = oldData[prizeIndex];
                    // 如果旧奖品不存在
                    if (!oldPrize)
                        prizeImgs = newPrize.imgs || [];
                    // 新奖品有图片才能进行对比
                    else if (newPrize.imgs)
                        newPrize.imgs.forEach(function (newImg, imgIndex) {
                            if (!oldPrize.imgs)
                                return prizeImgs[imgIndex] = newImg;
                            var oldImg = oldPrize.imgs[imgIndex];
                            // 如果旧值不存在
                            if (!oldImg)
                                prizeImgs[imgIndex] = newImg;
                            // 如果缓存中没有奖品或图片
                            else if (!_this.prizeImgs[prizeIndex] || !_this.prizeImgs[prizeIndex][imgIndex]) {
                                prizeImgs[imgIndex] = newImg;
                            }
                            // 如果新值和旧值的src不相等
                            else if (newImg.src !== oldImg.src)
                                prizeImgs[imgIndex] = newImg;
                        });
                    willUpdate[prizeIndex] = prizeImgs;
                });
            return _this.init(willUpdate);
        });
        // 观察按钮数据的变化
        this.$watch('buttons', function (newData, oldData) {
            var willUpdate = [];
            // 首次渲染时oldData为undefined
            if (!oldData)
                willUpdate = newData.map(function (btn) { return btn.imgs; });
            // 此时新值一定存在
            else if (newData)
                newData.forEach(function (newBtn, btnIndex) {
                    var btnImgs = [];
                    var oldBtn = oldData[btnIndex];
                    // 如果旧奖品不存在或旧奖品的图片不存在
                    if (!oldBtn || !oldBtn.imgs)
                        btnImgs = newBtn.imgs || [];
                    // 新奖品有图片才能进行对比
                    else if (newBtn.imgs)
                        newBtn.imgs.forEach(function (newImg, imgIndex) {
                            if (!oldBtn.imgs)
                                return btnImgs[imgIndex] = newImg;
                            var oldImg = oldBtn.imgs[imgIndex];
                            // 如果旧值不存在
                            if (!oldImg)
                                btnImgs[imgIndex] = newImg;
                            // 如果缓存中没有按钮或图片
                            else if (!_this.btnImgs[btnIndex] || !_this.btnImgs[btnIndex][imgIndex]) {
                                btnImgs[imgIndex] = newImg;
                            }
                            // 如果新值和旧值的src不相等
                            else if (newImg.src !== oldImg.src)
                                btnImgs[imgIndex] = newImg;
                        });
                    willUpdate[btnIndex] = btnImgs;
                });
            return _this.init(__spreadArrays(new Array(_this.prizes.length).fill(undefined), willUpdate));
        });
    };
    /**
     * 初始化 canvas 抽奖
     * @param { Array<ImgType[]> } willUpdateImgs 需要更新的图片
     */
    LuckyWheel.prototype.init = function (willUpdateImgs) {
        var _this = this;
        this.setDpr();
        this.setHTMLFontSize();
        var _a = this, box = _a.box, canvas = _a.canvas, ctx = _a.ctx, dpr = _a.dpr;
        if (!box)
            return;
        canvas.width = canvas.height = box.offsetWidth * dpr;
        this.Radius = canvas.width / 2;
        this.optimizeClarity(canvas, this.Radius * 2, this.Radius * 2);
        ctx.translate(this.Radius, this.Radius);
        var endCallBack = function () {
            // 开始绘制
            _this.draw();
            // 防止多次绑定点击事件
            canvas.onclick = function (e) {
                var _a;
                ctx.beginPath();
                ctx.arc(0, 0, _this.maxBtnRadius, 0, Math.PI * 2, false);
                if (!ctx.isPointInPath(e.offsetX, e.offsetY))
                    return;
                if (_this.startTime)
                    return;
                (_a = _this.startCallback) === null || _a === void 0 ? void 0 : _a.call(_this, e);
            };
        };
        // 同步加载图片
        var num = 0, sum = 0;
        if (isExpectType(willUpdateImgs, 'array')) {
            this.draw(); // 先画一次防止闪烁, 因为加载图片是异步的
            willUpdateImgs.forEach(function (imgs, cellIndex) {
                if (!imgs)
                    return false;
                imgs.forEach(function (imgInfo, imgIndex) {
                    sum++;
                    _this.loadAndCacheImg(cellIndex, imgIndex, function () {
                        num++;
                        if (sum === num)
                            endCallBack.call(_this);
                    });
                });
            });
        }
        if (!sum)
            endCallBack.call(this);
    };
    /**
     * 单独加载某一张图片并计算其实际渲染宽高
     * @param { number } cellIndex 奖品索引
     * @param { number } imgIndex 奖品图片索引
     * @param { Function } callBack 图片加载完毕回调
     */
    LuckyWheel.prototype.loadAndCacheImg = function (cellIndex, imgIndex, callBack) {
        var _this = this;
        // 先判断index是奖品图片还是按钮图片, 并修正index的值
        var isPrize = cellIndex < this.prizes.length;
        var cellName = isPrize ? 'prizes' : 'buttons';
        var imgName = isPrize ? 'prizeImgs' : 'btnImgs';
        cellIndex = isPrize ? cellIndex : cellIndex - this.prizes.length;
        // 获取图片信息
        var cell = this[cellName][cellIndex];
        if (!cell || !cell.imgs)
            return;
        var imgInfo = cell.imgs[imgIndex];
        if (!imgInfo)
            return;
        // 创建图片
        var imgObj = new Image();
        if (!this[imgName][cellIndex])
            this[imgName][cellIndex] = [];
        // 创建缓存
        this[imgName][cellIndex][imgIndex] = imgObj;
        imgObj.src = imgInfo.src;
        imgObj.onload = function () { return callBack.call(_this); };
    };
    /**
     * 计算图片的渲染宽高
     * @param imgObj 图片标签元素
     * @param imgInfo 图片信息
     * @param computedWidth 宽度百分比
     * @param computedHeight 高度百分比
     * @return [渲染宽度, 渲染高度]
     */
    LuckyWheel.prototype.computedWidthAndHeight = function (imgObj, imgInfo, computedWidth, computedHeight) {
        // 根据配置的样式计算图片的真实宽高
        if (!imgInfo.width && !imgInfo.height) {
            // 如果没有配置宽高, 则使用图片本身的宽高
            return [imgObj.width, imgObj.height];
        }
        else if (imgInfo.width && !imgInfo.height) {
            // 如果只填写了宽度, 没填写高度
            var trueWidth = this.getWidth(imgInfo.width, computedWidth);
            // 那高度就随着宽度进行等比缩放
            return [trueWidth, imgObj.height * (trueWidth / imgObj.width)];
        }
        else if (!imgInfo.width && imgInfo.height) {
            // 如果只填写了宽度, 没填写高度
            var trueHeight = this.getHeight(imgInfo.height, computedHeight);
            // 那宽度就随着高度进行等比缩放
            return [imgObj.width * (trueHeight / imgObj.height), trueHeight];
        }
        // 如果宽度和高度都填写了, 就如实计算
        return [
            this.getWidth(imgInfo.width, computedWidth),
            this.getHeight(imgInfo.height, computedHeight)
        ];
    };
    /**
     * 开始绘制
     */
    LuckyWheel.prototype.draw = function () {
        var _this = this;
        var _a = this, ctx = _a.ctx, dpr = _a.dpr, _defaultConfig = _a._defaultConfig, _defaultStyle = _a._defaultStyle;
        ctx.clearRect(-this.Radius, -this.Radius, this.Radius * 2, this.Radius * 2);
        // 绘制blocks边框
        this.prizeRadius = this.blocks.reduce(function (radius, block) {
            ctx.beginPath();
            ctx.fillStyle = block.background;
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
            ctx.fill();
            return radius - _this.getLength(block.padding.split(' ')[0]) * dpr;
        }, this.Radius);
        // 计算起始弧度
        this.prizeDeg = 360 / this.prizes.length;
        this.prizeRadian = getAngle(this.prizeDeg);
        var start = getAngle(-90 + this.rotateDeg + _defaultConfig.offsetDegree);
        // 计算文字横坐标
        var getFontX = function (line) {
            return _this.getOffsetX(ctx.measureText(line).width);
        };
        // 计算文字纵坐标
        var getFontY = function (font, height, lineIndex) {
            // 优先使用字体行高, 要么使用默认行高, 其次使用字体大小, 否则使用默认字体大小
            var lineHeight = font.lineHeight || _defaultStyle.lineHeight || font.fontSize || _defaultStyle.fontSize;
            return _this.getHeight(font.top, height) + (lineIndex + 1) * _this.getLength(lineHeight) * dpr;
        };
        ctx.save();
        // 绘制prizes奖品区域
        this.prizes.forEach(function (prize, prizeIndex) {
            // 计算当前奖品区域中间坐标点
            var currMiddleDeg = start + prizeIndex * _this.prizeRadian;
            // 奖品区域可见高度
            var prizeHeight = _this.prizeRadius - _this.maxBtnRadius;
            // 绘制背景
            drawSector(ctx, _this.maxBtnRadius, _this.prizeRadius, currMiddleDeg - _this.prizeRadian / 2, currMiddleDeg + _this.prizeRadian / 2, _this.getLength(_defaultConfig.gutter) * dpr, prize.background || _defaultStyle.background || 'rgba(0, 0, 0, 0)');
            // 计算临时坐标并旋转文字
            var x = Math.cos(currMiddleDeg) * _this.prizeRadius;
            var y = Math.sin(currMiddleDeg) * _this.prizeRadius;
            ctx.translate(x, y);
            ctx.rotate(currMiddleDeg + getAngle(90));
            // 绘制图片
            prize.imgs && prize.imgs.forEach(function (imgInfo, imgIndex) {
                if (!_this.prizeImgs[prizeIndex])
                    return;
                var prizeImg = _this.prizeImgs[prizeIndex][imgIndex];
                if (!prizeImg)
                    return;
                var _a = _this.computedWidthAndHeight(prizeImg, imgInfo, _this.prizeRadian * _this.prizeRadius, prizeHeight), trueWidth = _a[0], trueHeight = _a[1];
                ctx.drawImage(prizeImg, _this.getOffsetX(trueWidth), _this.getHeight(imgInfo.top, prizeHeight), trueWidth, trueHeight);
            });
            // 逐行绘制文字
            prize.fonts && prize.fonts.forEach(function (font) {
                var fontColor = font.fontColor || _defaultStyle.fontColor;
                var fontWeight = font.fontWeight || _defaultStyle.fontWeight;
                var fontSize = _this.getLength(font.fontSize || _defaultStyle.fontSize);
                var fontStyle = font.fontStyle || _defaultStyle.fontStyle;
                ctx.fillStyle = fontColor;
                ctx.font = fontWeight + " " + fontSize * dpr + "px " + fontStyle;
                var lines = [], text = String(font.text);
                if (font.hasOwnProperty('wordWrap') ? font.wordWrap : _defaultStyle.wordWrap) {
                    text = removeEnter(text);
                    var str = '';
                    for (var i = 0; i < text.length; i++) {
                        str += text[i];
                        var currWidth = ctx.measureText(str).width;
                        var maxWidth = (_this.prizeRadius - getFontY(font, prizeHeight, lines.length))
                            * Math.tan(_this.prizeRadian / 2) * 2 - _this.getLength(_defaultConfig.gutter) * dpr;
                        if (currWidth > _this.getWidth(font.lengthLimit || _defaultStyle.lengthLimit, maxWidth)) {
                            lines.push(str.slice(0, -1));
                            str = text[i];
                        }
                    }
                    if (str)
                        lines.push(str);
                    if (!lines.length)
                        lines.push(text);
                }
                else {
                    lines = text.split('\n');
                }
                lines.filter(function (line) { return !!line; }).forEach(function (line, lineIndex) {
                    ctx.fillText(line, getFontX(line), getFontY(font, prizeHeight, lineIndex));
                });
            });
            // 修正旋转角度和原点坐标
            ctx.rotate(getAngle(360) - currMiddleDeg - getAngle(90));
            ctx.translate(-x, -y);
        });
        ctx.restore();
        // 绘制按钮
        this.buttons.forEach(function (btn, btnIndex) {
            var radius = _this.getHeight(btn.radius);
            // 绘制背景颜色
            _this.maxBtnRadius = Math.max(_this.maxBtnRadius, radius);
            ctx.beginPath();
            ctx.fillStyle = btn.background || 'rgba(0, 0, 0, 0)';
            ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
            ctx.fill();
            // 绘制指针
            if (btn.pointer) {
                ctx.beginPath();
                ctx.fillStyle = btn.background || 'rgba(0, 0, 0, 0)';
                ctx.moveTo(-radius, 0);
                ctx.lineTo(radius, 0);
                ctx.lineTo(0, -radius * 2);
                ctx.closePath();
                ctx.fill();
            }
            // 绘制按钮图片
            btn.imgs && btn.imgs.forEach(function (imgInfo, imgIndex) {
                if (!_this.btnImgs[btnIndex])
                    return;
                var btnImg = _this.btnImgs[btnIndex][imgIndex];
                if (!btnImg)
                    return;
                // 计算图片真实宽高
                var _a = _this.computedWidthAndHeight(btnImg, imgInfo, _this.getHeight(btn.radius) * 2, _this.getHeight(btn.radius) * 2), trueWidth = _a[0], trueHeight = _a[1];
                // 绘制图片
                ctx.drawImage(btnImg, _this.getOffsetX(trueWidth), _this.getHeight(imgInfo.top, radius), trueWidth, trueHeight);
            });
            // 绘制按钮文字
            btn.fonts && btn.fonts.forEach(function (font) {
                var fontColor = font.fontColor || _defaultStyle.fontColor;
                var fontWeight = font.fontWeight || _defaultStyle.fontWeight;
                var fontSize = _this.getLength(font.fontSize || _defaultStyle.fontSize);
                var fontStyle = font.fontStyle || _defaultStyle.fontStyle;
                ctx.fillStyle = fontColor;
                ctx.font = fontWeight + " " + fontSize * dpr + "px " + fontStyle;
                String(font.text).split('\n').forEach(function (line, lineIndex) {
                    ctx.fillText(line, getFontX(line), getFontY(font, radius, lineIndex));
                });
            });
        });
    };
    /**
     * 对外暴露: 开始抽奖方法
     */
    LuckyWheel.prototype.play = function () {
        // 再次拦截, 因为play是可以异步调用的
        if (this.startTime)
            return;
        cancelAnimationFrame(this.animationId);
        this.startTime = Date.now();
        this.prizeFlag = undefined;
        this.run();
    };
    /**
     * 对外暴露: 缓慢停止方法
     * @param index 中奖索引
     */
    LuckyWheel.prototype.stop = function (index) {
        this.prizeFlag = Number(index) % this.prizes.length;
    };
    /**
     * 实际开始执行方法
     * @param num 记录帧动画执行多少次
     */
    LuckyWheel.prototype.run = function (num) {
        if (num === void 0) { num = 0; }
        var _a = this, prizeFlag = _a.prizeFlag, prizeDeg = _a.prizeDeg, rotateDeg = _a.rotateDeg, _defaultConfig = _a._defaultConfig;
        var interval = Date.now() - this.startTime;
        // 先完全旋转, 再停止
        if (interval >= _defaultConfig.accelerationTime && prizeFlag !== undefined) {
            // 记录帧率
            this.FPS = interval / num;
            // 记录开始停止的时间戳
            this.endTime = Date.now();
            // 记录开始停止的位置
            this.stopDeg = rotateDeg;
            // 测算最终停止的角度
            var i = 0;
            while (++i) {
                var endDeg = 360 * i - prizeFlag * prizeDeg - rotateDeg - _defaultConfig.offsetDegree;
                var currSpeed = quad.easeOut(this.FPS, this.stopDeg, endDeg, _defaultConfig.decelerationTime) - this.stopDeg;
                if (currSpeed > _defaultConfig.speed) {
                    this.endDeg = endDeg;
                    break;
                }
            }
            cancelAnimationFrame(this.animationId);
            return this.slowDown();
        }
        this.rotateDeg = (rotateDeg + quad.easeIn(interval, 0, _defaultConfig.speed, _defaultConfig.accelerationTime)) % 360;
        this.draw();
        this.animationId = window.requestAnimationFrame(this.run.bind(this, num + 1));
    };
    /**
     * 缓慢停止的方法
     */
    LuckyWheel.prototype.slowDown = function () {
        var _a;
        var _b = this, prizes = _b.prizes, prizeFlag = _b.prizeFlag, stopDeg = _b.stopDeg, endDeg = _b.endDeg, _defaultConfig = _b._defaultConfig;
        var interval = Date.now() - this.endTime;
        if (interval >= _defaultConfig.decelerationTime) {
            this.startTime = 0;
            (_a = this.endCallback) === null || _a === void 0 ? void 0 : _a.call(this, __assign({}, prizes.find(function (prize, index) { return index === prizeFlag; })));
            return cancelAnimationFrame(this.animationId);
        }
        this.rotateDeg = quad.easeOut(interval, stopDeg, endDeg, _defaultConfig.decelerationTime) % 360;
        this.draw();
        this.animationId = window.requestAnimationFrame(this.slowDown.bind(this));
    };
    /**
     * 获取长度
     * @param length 将要转换的长度
     * @return 返回长度
     */
    LuckyWheel.prototype.getLength = function (length) {
        if (isExpectType(length, 'number'))
            return length;
        if (isExpectType(length, 'string'))
            return this.changeUnits(length, { clean: true });
        return 0;
    };
    /**
     * 获取相对宽度
     * @param length 将要转换的宽度
     * @param width 宽度计算百分比
     * @return 返回相对宽度
     */
    LuckyWheel.prototype.getWidth = function (length, width) {
        if (width === void 0) { width = this.prizeRadian * this.prizeRadius; }
        if (isExpectType(length, 'number'))
            return length * this.dpr;
        if (isExpectType(length, 'string'))
            return this.changeUnits(length, { denominator: width });
        return 0;
    };
    /**
     * 获取相对高度
     * @param length 将要转换的高度
     * @param height 高度计算百分比
     * @return 返回相对高度
     */
    LuckyWheel.prototype.getHeight = function (length, height) {
        if (height === void 0) { height = this.prizeRadius; }
        if (isExpectType(length, 'number'))
            return length * this.dpr;
        if (isExpectType(length, 'string'))
            return this.changeUnits(length, { denominator: height });
        return 0;
    };
    /**
     * 获取相对(居中)X坐标
     * @param width
     * @return 返回x坐标
     */
    LuckyWheel.prototype.getOffsetX = function (width) {
        return -width / 2;
    };
    return LuckyWheel;
}(Lucky));

var LuckyGrid = /** @class */ (function (_super) {
    __extends(LuckyGrid, _super);
    /**
     * 九宫格构造器
     * @param el 元素标识
     * @param data 抽奖配置项
     */
    function LuckyGrid(el, data) {
        if (data === void 0) { data = {}; }
        var _this = _super.call(this, el) || this;
        _this.rows = 3;
        _this.cols = 3;
        _this.blocks = [];
        _this.prizes = [];
        _this.defaultConfig = {};
        _this._defaultConfig = {
            gutter: 5,
            speed: 20,
            accelerationTime: 2500,
            decelerationTime: 2500,
        };
        _this.defaultStyle = {};
        _this._defaultStyle = {
            borderRadius: 20,
            fontColor: '#000',
            fontSize: '18px',
            fontStyle: 'microsoft yahei ui,microsoft yahei,simsun,sans-serif',
            fontWeight: '400',
            lineHeight: '',
            background: '#fff',
            shadow: '',
            wordWrap: true,
            lengthLimit: '90%',
        };
        _this.activeStyle = {};
        _this._activeStyle = {
            background: '#ffce98',
            shadow: '',
            fontStyle: '',
            fontWeight: '',
            fontSize: '',
            lineHeight: '',
            fontColor: '',
        };
        _this.boxWidth = 0; // 九宫格宽度
        _this.boxHeight = 0; // 九宫格高度
        _this.cellWidth = 0; // 格子宽度
        _this.cellHeight = 0; // 格子高度
        _this.startTime = 0; // 开始时间戳
        _this.endTime = 0; // 结束时间戳
        _this.currIndex = 0; // 当前index累加
        _this.stopIndex = 0; // 刻舟求剑
        _this.endIndex = 0; // 停止索引
        _this.demo = false; // 是否自动游走
        _this.timer = 0; // 游走定时器
        _this.animationId = 0; // 帧动画id
        _this.FPS = 16.6; // 屏幕刷新率
        // 所有格子
        _this.cells = [];
        // 图片缓存
        _this.cellImgs = [];
        _this.initData(data);
        _this.initComputed();
        _this.initWatch();
        // 收集首次渲染的图片
        var willUpdate = [[]];
        _this.prizes && (willUpdate = _this.prizes.map(function (prize) { return prize.imgs; }));
        _this.button && (willUpdate[_this.cols * _this.rows - 1] = _this.button.imgs);
        _this.init(willUpdate);
        return _this;
    }
    /**
     * 初始化数据
     * @param data
     */
    LuckyGrid.prototype.initData = function (data) {
        this.$set(this, 'rows', Number(data.rows) || 3);
        this.$set(this, 'cols', Number(data.cols) || 3);
        this.$set(this, 'blocks', data.blocks || []);
        this.$set(this, 'prizes', data.prizes || []);
        this.$set(this, 'button', data.button);
        this.$set(this, 'defaultConfig', data.defaultConfig || {});
        this.$set(this, 'defaultStyle', data.defaultStyle || {});
        this.$set(this, 'activeStyle', data.activeStyle || {});
        this.$set(this, 'startCallback', data.start);
        this.$set(this, 'endCallback', data.end);
    };
    /**
     * 初始化属性计算
     */
    LuckyGrid.prototype.initComputed = function () {
        var _this = this;
        // 默认配置
        this.$computed(this, '_defaultConfig', function () {
            var config = __assign({ gutter: 5, speed: 20, accelerationTime: 2500, decelerationTime: 2500 }, _this.defaultConfig);
            config.gutter = _this.getLength(config.gutter) * _this.dpr;
            config.speed = config.speed / 40;
            return config;
        });
        // 默认样式
        this.$computed(this, '_defaultStyle', function () {
            return __assign({ borderRadius: 20, fontColor: '#000', fontSize: '18px', fontStyle: 'microsoft yahei ui,microsoft yahei,simsun,sans-serif', fontWeight: '400', background: '#fff', shadow: '', wordWrap: true, lengthLimit: '90%' }, _this.defaultStyle);
        });
        // 中奖样式
        this.$computed(this, '_activeStyle', function () {
            return __assign({ background: '#ffce98', shadow: '' }, _this.activeStyle);
        });
    };
    /**
     * 初始化观察者
     */
    LuckyGrid.prototype.initWatch = function () {
        var _this = this;
        // 监听奖品数据的变化
        this.$watch('prizes', function (newData, oldData) {
            var willUpdate = [];
            // 首次渲染时oldData为undefined
            if (!oldData)
                willUpdate = newData.map(function (prize) { return prize.imgs; });
            // 此时新值一定存在
            else if (newData)
                newData.forEach(function (newPrize, prizeIndex) {
                    var prizeImgs = [];
                    var oldPrize = oldData[prizeIndex];
                    // 如果旧奖品不存在
                    if (!oldPrize)
                        prizeImgs = newPrize.imgs || [];
                    // 新奖品有图片才能进行对比
                    else if (newPrize.imgs)
                        newPrize.imgs.forEach(function (newImg, imgIndex) {
                            if (!oldPrize.imgs)
                                return prizeImgs[imgIndex] = newImg;
                            var oldImg = oldPrize.imgs[imgIndex];
                            // 如果旧值不存在
                            if (!oldImg)
                                prizeImgs[imgIndex] = newImg;
                            // 如果缓存中没有图片
                            else if (!_this.cellImgs[prizeIndex][imgIndex])
                                prizeImgs[imgIndex] = newImg;
                            // 如果新值和旧值的src不相等
                            else if (newImg.src !== oldImg.src)
                                prizeImgs[imgIndex] = newImg;
                        });
                    willUpdate[prizeIndex] = prizeImgs;
                });
            return _this.init(willUpdate);
        });
        // 监听按钮数据的变化
        this.$watch('button', function (newData, oldData) {
            var willUpdate = [], btnIndex = _this.cols * _this.rows - 1;
            // 首次渲染时, oldData不存在
            if (!oldData || !oldData.imgs)
                willUpdate[btnIndex] = newData.imgs;
            // 如果新值存在img, 才能进行对比
            else if (newData.imgs) {
                var btnImg_1 = [];
                newData.imgs.forEach(function (newImg, imgIndex) {
                    if (!oldData.imgs)
                        return btnImg_1[imgIndex] = newImg;
                    var oldImg = oldData.imgs[imgIndex];
                    // 如果旧值不存在
                    if (!oldImg)
                        btnImg_1[imgIndex] = newImg;
                    // 如果缓存中没有图片
                    else if (!_this.cellImgs[btnIndex][imgIndex])
                        btnImg_1[imgIndex] = newImg;
                    // 如果新值和旧值的src不相等
                    else if (newImg.src !== oldImg.src)
                        btnImg_1[imgIndex] = newImg;
                });
                willUpdate[btnIndex] = btnImg_1;
            }
            return _this.init(willUpdate);
        });
    };
    /**
     * 初始化 canvas 抽奖
     * @param willUpdateImgs 需要更新的图片
     */
    LuckyGrid.prototype.init = function (willUpdateImgs) {
        var _this = this;
        this.setDpr();
        this.setHTMLFontSize();
        var _a = this, box = _a.box, canvas = _a.canvas, dpr = _a.dpr;
        if (!box)
            return;
        this.boxWidth = canvas.width = box.offsetWidth * dpr;
        this.boxHeight = canvas.height = box.offsetHeight * dpr;
        this.optimizeClarity(canvas, this.boxWidth, this.boxHeight);
        var endCallBack = function () {
            // 开始首次渲染
            _this.draw();
            // 中奖标识开始游走
            _this.demo && _this.walk();
            // 点击按钮开始, 这里不能使用 addEventListener
            if (_this.button)
                canvas.onclick = function (e) {
                    var _a;
                    var _b = _this.getGeometricProperty([
                        _this.button.x,
                        _this.button.y,
                        _this.button.col || 1,
                        _this.button.row || 1
                    ]), x = _b[0], y = _b[1], width = _b[2], height = _b[3];
                    if (e.offsetX < x || e.offsetY < y || e.offsetX > x + width || e.offsetY > y + height)
                        return false;
                    if (_this.startTime)
                        return;
                    (_a = _this.startCallback) === null || _a === void 0 ? void 0 : _a.call(_this, e);
                };
        };
        // 同步加载图片
        var num = 0, sum = 0;
        if (isExpectType(willUpdateImgs, 'array')) {
            this.draw(); // 先画一次防止闪烁, 因为加载图片是异步的
            willUpdateImgs.forEach(function (imgs, cellIndex) {
                if (!imgs)
                    return false;
                imgs.forEach(function (imgInfo, imgIndex) {
                    sum++;
                    _this.loadAndCacheImg(cellIndex, imgIndex, function () {
                        num++;
                        if (sum === num)
                            endCallBack.call(_this);
                    });
                });
            });
        }
        if (!sum)
            endCallBack.call(this);
    };
    /**
     * 单独加载某一张图片并计算其实际渲染宽高
     * @param { number } prizeIndex 奖品索引
     * @param { number } imgIndex 奖品图片索引
     * @param { Function } callBack 图片加载完毕回调
     */
    LuckyGrid.prototype.loadAndCacheImg = function (prizeIndex, imgIndex, callBack) {
        var _this = this;
        var prize = this.cells[prizeIndex];
        if (!prize || !prize.imgs)
            return;
        var imgInfo = prize.imgs[imgIndex];
        if (!this.cellImgs[prizeIndex])
            this.cellImgs[prizeIndex] = [];
        // 加载 defaultImg 默认图片
        var defaultImg = new Image();
        this.cellImgs[prizeIndex][imgIndex] = { defaultImg: defaultImg };
        defaultImg.src = imgInfo.src;
        var num = 0, sum = 1;
        defaultImg.onload = function () {
            num++;
            num === sum && callBack.call(_this);
        };
        // 如果有 activeImg 则多加载一张
        if (!imgInfo.hasOwnProperty('activeSrc'))
            return;
        sum++;
        var activeImg = new Image();
        this.cellImgs[prizeIndex][imgIndex].activeImg = activeImg;
        activeImg.src = imgInfo.activeSrc;
        activeImg.onload = function () {
            num++;
            num === sum && callBack.call(_this);
        };
    };
    /**
     * 计算图片的渲染宽高
     * @param imgObj 图片标签元素
     * @param imgInfo 图片信息
     * @param cell 格子信息
     * @return [渲染宽度, 渲染高度]
     */
    LuckyGrid.prototype.computedWidthAndHeight = function (imgObj, imgInfo, cell) {
        // 根据配置的样式计算图片的真实宽高
        if (!imgInfo.width && !imgInfo.height) {
            // 如果没有配置宽高, 则使用图片本身的宽高
            return [imgObj.width, imgObj.height];
        }
        else if (imgInfo.width && !imgInfo.height) {
            // 如果只填写了宽度, 没填写高度
            var trueWidth = this.getWidth(imgInfo.width, cell.col);
            // 那高度就随着宽度进行等比缩放
            return [trueWidth, imgObj.height * (trueWidth / imgObj.width)];
        }
        else if (!imgInfo.width && imgInfo.height) {
            // 如果只填写了宽度, 没填写高度
            var trueHeight = this.getHeight(imgInfo.height, cell.row);
            // 那宽度就随着高度进行等比缩放
            return [imgObj.width * (trueHeight / imgObj.height), trueHeight];
        }
        // 如果宽度和高度都填写了, 就分别计算
        return [
            this.getWidth(imgInfo.width, cell.col),
            this.getHeight(imgInfo.height, cell.row)
        ];
    };
    /**
     * 绘制九宫格抽奖
     */
    LuckyGrid.prototype.draw = function () {
        var _this = this;
        var _a = this, ctx = _a.ctx, dpr = _a.dpr, _defaultConfig = _a._defaultConfig, _defaultStyle = _a._defaultStyle, _activeStyle = _a._activeStyle;
        // 清空画布
        ctx.clearRect(0, 0, this.boxWidth, this.boxWidth);
        // 合并奖品和按钮
        this.cells = __spreadArrays(this.prizes);
        if (this.button)
            this.cells[this.cols * this.rows - 1] = this.button;
        this.cells.forEach(function (cell) {
            cell.col = cell.col || 1;
            cell.row = cell.row || 1;
        });
        // 计算获取奖品区域的几何信息
        this.prizeArea = this.blocks.reduce(function (_a, block) {
            var x = _a.x, y = _a.y, w = _a.w, h = _a.h;
            var _b = computePadding(block).map(function (n) { return n * dpr; }), paddingTop = _b[0], paddingBottom = _b[1], paddingLeft = _b[2], paddingRight = _b[3];
            var r = block.borderRadius ? _this.getLength(block.borderRadius) * dpr : 0;
            // 绘制边框
            drawRoundRect(ctx, x, y, w, h, r, _this.handleBackground(x, y, w, h, block.background));
            return {
                x: x + paddingLeft,
                y: y + paddingTop,
                w: w - paddingLeft - paddingRight,
                h: h - paddingTop - paddingBottom
            };
        }, { x: 0, y: 0, w: this.boxWidth, h: this.boxHeight });
        // 计算单一奖品格子的宽度和高度
        this.cellWidth = (this.prizeArea.w - _defaultConfig.gutter * (this.cols - 1)) / this.cols;
        this.cellHeight = (this.prizeArea.h - _defaultConfig.gutter * (this.rows - 1)) / this.rows;
        // 绘制所有格子
        this.cells.forEach(function (prize, cellIndex) {
            var _a = _this.getGeometricProperty([prize.x, prize.y, prize.col, prize.row]), x = _a[0], y = _a[1], width = _a[2], height = _a[3];
            var isActive = cellIndex === _this.currIndex % _this.prizes.length >> 0;
            // 处理阴影 (暂时先用any, 这里后续要优化)
            var shadow = (isActive ? _activeStyle.shadow : (prize.shadow || _defaultStyle.shadow))
                .replace(/px/g, '') // 清空px字符串
                .split(',')[0].split(' ') // 防止有人声明多个阴影, 截取第一个阴影
                .map(function (n, i) { return i < 3 ? Number(n) * dpr : n; }); // 把数组的前三个值*像素比
            // 绘制阴影
            if (shadow.length === 4) {
                ctx.shadowColor = shadow[3];
                ctx.shadowOffsetX = shadow[0];
                ctx.shadowOffsetY = shadow[1];
                ctx.shadowBlur = shadow[2];
                // 修正(格子+阴影)的位置, 这里使用逗号运算符
                shadow[0] > 0 ? (width -= shadow[0]) : (width += shadow[0], x -= shadow[0]);
                shadow[1] > 0 ? (height -= shadow[1]) : (height += shadow[1], y -= shadow[1]);
            }
            drawRoundRect(ctx, x, y, width, height, _this.getLength(prize.borderRadius ? prize.borderRadius : _defaultStyle.borderRadius) * dpr, _this.handleBackground(x, y, width, height, prize.background, isActive));
            // 清空阴影
            ctx.shadowColor = 'rgba(255, 255, 255, 0)';
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
            // 绘制图片
            prize.imgs && prize.imgs.forEach(function (imgInfo, imgIndex) {
                if (!_this.cellImgs[cellIndex])
                    return false;
                var cellImg = _this.cellImgs[cellIndex][imgIndex];
                if (!cellImg)
                    return false;
                var renderImg = (isActive && cellImg.activeImg) || cellImg.defaultImg;
                var _a = _this.computedWidthAndHeight(renderImg, imgInfo, prize), trueWidth = _a[0], trueHeight = _a[1];
                ctx.drawImage(renderImg, x + _this.getOffsetX(trueWidth, prize.col), y + _this.getHeight(imgInfo.top, prize.row), trueWidth, trueHeight);
            });
            // 绘制文字
            prize.fonts && prize.fonts.forEach(function (font) {
                // 字体样式
                var style = isActive && _activeStyle.fontStyle
                    ? _activeStyle.fontStyle
                    : (font.fontStyle || _defaultStyle.fontStyle);
                // 字体加粗
                var fontWeight = isActive && _activeStyle.fontWeight
                    ? _activeStyle.fontWeight
                    : (font.fontWeight || _defaultStyle.fontWeight);
                // 字体大小
                var size = isActive && _activeStyle.fontSize
                    ? _this.getLength(_activeStyle.fontSize)
                    : _this.getLength(font.fontSize || _defaultStyle.fontSize);
                // 字体行高
                var lineHeight = isActive && _activeStyle.lineHeight
                    ? _activeStyle.lineHeight
                    : font.lineHeight || _defaultStyle.lineHeight || font.fontSize || _defaultStyle.fontSize;
                ctx.font = fontWeight + " " + size * dpr + "px " + style;
                ctx.fillStyle = (isActive && _activeStyle.fontColor) ? _activeStyle.fontColor : (font.fontColor || _defaultStyle.fontColor);
                var lines = [], text = String(font.text);
                // 计算文字换行
                if (font.hasOwnProperty('wordWrap') ? font.wordWrap : _defaultStyle.wordWrap) {
                    text = removeEnter(text);
                    var str = '';
                    for (var i = 0; i < text.length; i++) {
                        str += text[i];
                        var currWidth = ctx.measureText(str).width;
                        var maxWidth = _this.getWidth(font.lengthLimit || _defaultStyle.lengthLimit, prize.col);
                        if (currWidth > maxWidth) {
                            lines.push(str.slice(0, -1));
                            str = text[i];
                        }
                    }
                    if (str)
                        lines.push(str);
                    if (!lines.length)
                        lines.push(text);
                }
                else {
                    lines = text.split('\n');
                }
                lines.forEach(function (line, lineIndex) {
                    ctx.fillText(line, x + _this.getOffsetX(ctx.measureText(line).width, prize.col), y + _this.getHeight(font.top, prize.row) + (lineIndex + 1) * _this.getLength(lineHeight) * dpr);
                });
            });
        });
    };
    /**
     * 处理背景色
     * @param x
     * @param y
     * @param width
     * @param height
     * @param background
     * @param isActive
     */
    LuckyGrid.prototype.handleBackground = function (x, y, width, height, background, isActive) {
        if (isActive === void 0) { isActive = false; }
        var _a = this, ctx = _a.ctx, _defaultStyle = _a._defaultStyle, _activeStyle = _a._activeStyle;
        background = isActive ? _activeStyle.background : (background || _defaultStyle.background);
        // 处理线性渐变
        if (background.includes('linear-gradient')) {
            background = getLinearGradient(ctx, x, y, width, height, background);
        }
        return background;
    };
    /**
     * 对外暴露: 开始抽奖方法
     */
    LuckyGrid.prototype.play = function () {
        if (this.startTime)
            return;
        clearInterval(this.timer);
        cancelAnimationFrame(this.animationId);
        this.startTime = Date.now();
        this.prizeFlag = undefined;
        this.run();
    };
    /**
     * 对外暴露: 缓慢停止方法
     * @param index 中奖索引
     */
    LuckyGrid.prototype.stop = function (index) {
        this.prizeFlag = index % this.prizes.length;
    };
    /**
     * 实际开始执行方法
     * @param num 记录帧动画执行多少次
     */
    LuckyGrid.prototype.run = function (num) {
        if (num === void 0) { num = 0; }
        var _a = this, currIndex = _a.currIndex, prizes = _a.prizes, prizeFlag = _a.prizeFlag, startTime = _a.startTime, _defaultConfig = _a._defaultConfig;
        var interval = Date.now() - startTime;
        // 先完全旋转, 再停止
        if (interval >= _defaultConfig.accelerationTime && prizeFlag !== undefined) {
            // 记录帧率
            this.FPS = interval / num;
            // 记录开始停止的时间戳
            this.endTime = Date.now();
            // 记录开始停止的索引
            this.stopIndex = currIndex;
            // 测算最终停止的索引
            var i = 0;
            while (++i) {
                var endIndex = prizes.length * i + prizeFlag - (currIndex >> 0);
                var currSpeed = quad.easeOut(this.FPS, this.stopIndex, endIndex, _defaultConfig.decelerationTime) - this.stopIndex;
                if (currSpeed > _defaultConfig.speed) {
                    this.endIndex = endIndex;
                    break;
                }
            }
            cancelAnimationFrame(this.animationId);
            return this.slowDown();
        }
        this.currIndex = (currIndex + quad.easeIn(interval, 0.1, _defaultConfig.speed, _defaultConfig.accelerationTime)) % prizes.length;
        this.draw();
        this.animationId = window.requestAnimationFrame(this.run.bind(this, num + 1));
    };
    /**
     * 缓慢停止的方法
     */
    LuckyGrid.prototype.slowDown = function () {
        var _a;
        var _b = this, prizes = _b.prizes, prizeFlag = _b.prizeFlag, stopIndex = _b.stopIndex, endIndex = _b.endIndex, _defaultConfig = _b._defaultConfig;
        var interval = Date.now() - this.endTime;
        if (interval > _defaultConfig.decelerationTime) {
            this.startTime = 0;
            (_a = this.endCallback) === null || _a === void 0 ? void 0 : _a.call(this, __assign({}, prizes.find(function (prize, index) { return index === prizeFlag; })));
            return cancelAnimationFrame(this.animationId);
        }
        this.currIndex = quad.easeOut(interval, stopIndex, endIndex, _defaultConfig.decelerationTime) % prizes.length;
        this.draw();
        this.animationId = window.requestAnimationFrame(this.slowDown.bind(this));
    };
    /**
     * 开启中奖标识自动游走
     */
    LuckyGrid.prototype.walk = function () {
        var _this = this;
        clearInterval(this.timer);
        this.timer = window.setInterval(function () {
            _this.currIndex += 1;
            _this.draw();
        }, 1300);
    };
    /**
     * 计算奖品格子的几何属性
     * @param { array } [...矩阵坐标, col, row]
     * @return { array } [...真实坐标, width, height]
     */
    LuckyGrid.prototype.getGeometricProperty = function (_a) {
        var x = _a[0], y = _a[1], col = _a[2], row = _a[3];
        var _b = this, cellWidth = _b.cellWidth, cellHeight = _b.cellHeight;
        var gutter = this._defaultConfig.gutter;
        var res = [
            this.prizeArea.x + (cellWidth + gutter) * x,
            this.prizeArea.y + (cellHeight + gutter) * y
        ];
        col && row && res.push(cellWidth * col + gutter * (col - 1), cellHeight * row + gutter * (row - 1));
        return res;
    };
    /**
     * 获取长度
     * @param length 将要转换的长度
     * @return 返回长度
     */
    LuckyGrid.prototype.getLength = function (length) {
        if (isExpectType(length, 'number'))
            return length;
        if (isExpectType(length, 'string'))
            return this.changeUnits(length, { clean: true });
        return 0;
    };
    /**
     * 转换并获取宽度
     * @param width 将要转换的宽度
     * @param col 横向合并的格子
     * @return 返回相对宽度
     */
    LuckyGrid.prototype.getWidth = function (width, col) {
        if (col === void 0) { col = 1; }
        if (isExpectType(width, 'number'))
            return width * this.dpr;
        if (isExpectType(width, 'string'))
            return this.changeUnits(width, { denominator: this.cellWidth * col + this._defaultConfig.gutter * (col - 1) });
        return 0;
    };
    /**
     * 转换并获取高度
     * @param height 将要转换的高度
     * @param row 纵向合并的格子
     * @return 返回相对高度
     */
    LuckyGrid.prototype.getHeight = function (height, row) {
        if (row === void 0) { row = 1; }
        if (isExpectType(height, 'number'))
            return height * this.dpr;
        if (isExpectType(height, 'string'))
            return this.changeUnits(height, { denominator: this.cellHeight * row + this._defaultConfig.gutter * (row - 1) });
        return 0;
    };
    /**
     * 获取相对(居中)X坐标
     * @param width
     * @param col
     */
    LuckyGrid.prototype.getOffsetX = function (width, col) {
        if (col === void 0) { col = 1; }
        return (this.cellWidth * col + this._defaultConfig.gutter * (col - 1) - width) / 2;
    };
    return LuckyGrid;
}(Lucky));

exports.LuckyGrid = LuckyGrid;
exports.LuckyWheel = LuckyWheel;
