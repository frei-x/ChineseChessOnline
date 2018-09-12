console.time('耗时');
/**
 *canvas出现毛边  一个是0.5px问题  一个是扩大canvas的宽高(提高分辨率)  再设置css进行缩放
 **/
"use strict"
let map = document.getElementById("map");
let box = document.getElementById("box");
//1rem=html根字体大小(px) ,getComputedStyle取出换算后 实际的px大小
//n:name,xy:转换后的坐标,t:red方或black方   
//地图数组下标 i换算坐标,每行9个(0开始 一行数组长度为8 ): 9y + x = i,其中y为i除以9 取整,x为i除以9 的余数
//													列 x = i-9y
//													行 y = (i-x)/9
let Root = {
	fontSize: parseFloat(getComputedStyle(document.documentElement, false)['fontSize']),
	arrMap: [{
			n: '車',
			xy: [0, 0],
			t: 'b'
		}, {
			n: '馬',
			xy: [1, 0],
			t: 'b'
		}, {
			n: '象',
			xy: [2, 0],
			t: 'b'
		}, {
			n: '仕',
			xy: [3, 0],
			t: 'b'
		}, {
			n: '將',
			xy: [4, 0],
			t: 'b'
		}, {
			n: '仕',
			xy: [5, 0],
			t: 'b'
		}, {
			n: '象',
			xy: [6, 0],
			t: 'b'
		}, {
			n: '馬',
			xy: [7, 0],
			t: 'b'
		}, {
			n: '車',
			xy: [8, 0],
			t: 'b'
		},
		{}, {}, {}, {}, {}, {}, {}, {}, {},
		{}, {
			n: '砲',
			xy: [1, 2],
			t: 'b'
		}, {}, {}, {}, {}, {}, {
			n: '砲',
			xy: [7, 2],
			t: 'b'
		}, {},
		{
			n: '卒',
			xy: [0, 3],
			t: 'b'
		}, {}, {
			n: '卒',
			xy: [2, 3],
			t: 'b'
		}, {}, {
			n: '卒',
			xy: [4, 3],
			t: 'b'
		}, {}, {
			n: '卒',
			xy: [6, 3],
			t: 'b'
		}, {}, {
			n: '卒',
			xy: [8, 3],
			t: 'b'
		},
		{}, {}, {}, {}, {}, {}, {}, {}, {},
		{}, {}, {}, {}, {}, {}, {}, {}, {},
		{
			n: '兵',
			xy: [0, 6],
			t: 'r'
		}, {}, {
			n: '兵',
			xy: [2, 6],
			t: 'r'
		}, {}, {
			n: '兵',
			xy: [4, 6],
			t: 'r'
		}, {}, {
			n: '兵',
			xy: [6, 6],
			t: 'r'
		}, {}, {
			n: '兵',
			xy: [8, 6],
			t: 'r'
		},
		{}, {
			n: '炮',
			xy: [1, 7],
			t: 'r'
		}, {}, {}, {}, {}, {}, {
			n: '炮',
			xy: [7, 7],
			t: 'r'
		}, {},
		{}, {}, {}, {}, {}, {}, {}, {}, {},
		{
			n: '車',
			xy: [0, 9],
			t: 'r'
		}, {
			n: '馬',
			xy: [1, 9],
			t: 'r'
		}, {
			n: '相',
			xy: [2, 9],
			t: 'r'
		}, {
			n: '士',
			xy: [3, 9],
			t: 'r'
		}, {
			n: '帥',
			xy: [4, 9],
			t: 'r'
		}, {
			n: '士',
			xy: [5, 9],
			t: 'r'
		}, {
			n: '相',
			xy: [6, 9],
			t: 'r'
		}, {
			n: '馬',
			xy: [7, 9],
			t: 'r'
		}, {
			n: '車',
			xy: [8, 9],
			t: 'r'
		},
	]
}
//选择宽高中最小长度 计算比例  
let mapSize = innerWidth >= innerHeight ? {
	width: Math.floor(innerHeight * 0.81 * 2),
	height: Math.floor(innerHeight * 0.9 * 2)
} : {
	width: Math.floor(innerWidth * 0.98 * 4),
	height: Math.floor(innerWidth * 1.1111 * 4)
};
//保证为整数  方便线条完整分割棋盘  并且不出现需要+0.5的毛边	
mapSize.width = mapSize.width % 8 == 0 ? mapSize.width : mapSize.width - mapSize.width % 8;
mapSize.height = mapSize.height % 9 == 0 ? mapSize.height : mapSize.height - mapSize.height % 9;
console.table(mapSize);
//由于棋盘大小需要   边界棋子不移出棋盘  扩大0.15倍
map.width = mapSize.width * 1.15;
map.height = mapSize.height * 1.15;
//map.height = map.width * window.devicePixelRatio;
//map.width = map.height * window.devicePixelRatio;
let w = Math.floor(mapSize.width / 8);
let h = Math.floor(mapSize.height / 9);
console.log(w);
let p = map.getContext('2d');
/*
 canvas真实尺寸与style尺寸比例不为2:1或者移动端的4:1,由于棋盘大小需要  下面的style尺寸大小为未扩大0.15倍前
 * 
 * */
if(innerWidth <= 700 && innerHeight > innerWidth) {
	map.style.cssText = "width: " + mapSize.width / 4 + "px;height:" + mapSize.height / 4 + "px;border: 0.16rem solid darkgoldenrod;";
	p.lineWidth = 3;
} else {
	p.lineWidth = 2;
	map.style.cssText = "width: " + mapSize.width / 2 + "px;height:" + mapSize.height / 2 + "px;";
}
map.style.marginLeft = -parseFloat(map.style.width) / 2 - 4 + 'px';
map.style.marginTop = -parseFloat(map.style.height) / 2 + 'px';
//canvas真实大小与屏幕显示大小比例(缩放倍数)
Root.canvasAndScreenRatioWidth = map.width / parseFloat(map.style.width);
Root.canvasAndScreenRatioHeight = map.height / parseFloat(map.style.height);
/**
 * x坐标转换函数:把棋子虚拟坐标转换为canvas真实坐标
 * @param {Number} x
 */
function funCoordinateX(x) {
	return mapSize.width / 8 * x + w / 8 + 0.5;
}

/**
 * y坐标转换函数
 * @param {Number} y
 */
function funCoordinateY(y) {
	return(mapSize.height) / 9 * y + h / 9 + 0.5;
}
//   p.scale(window.devicePixelRatio, window.devicePixelRatio);
//绘制棋盘
p.fillStyle = 'rgba(249,216,162,1)';
p.fillRect(0, 0, map.width, map.height);
p.beginPath();
p.strokeStyle = "#000";
p.translate(mapSize.width * (0.12 / 2), mapSize.height * (0.12 / 2))
//棋盘 竖线
console.log(mapSize.width);
//初始画点(线宽为1 最左边  最上边的线只显示一半)增加w/10  ,h/10
//分割两岸  从 0 画到4, 4~5为楚河汉界,从5 画到9
for(let i = 0; i < 9; i++) {
	p.moveTo(w * i + w / 8 + 0.5, h / 9 + 0.5);
	p.lineTo(w * i + w / 8 + 0.5, (mapSize.height) / 9 * 4 + h / 9 + 0.5);
	p.moveTo(w * i + w / 8 + 0.5, (mapSize.height) / 9 * 5 + h / 9 + 0.5);
	p.lineTo(w * i + w / 8 + 0.5, (mapSize.height) / 9 * 9 + h / 9 + 0.5);
	//第一条和最后一条竖线不分割
	if(i == 0 || i == 8) {
		p.moveTo(w * i + w / 8 + 0.5, (mapSize.height) / 9 * 4 + h / 9 + 0.5);
		p.lineTo(w * i + w / 8 + 0.5, (mapSize.height) / 9 * 5 + h / 9 + 0.5);
	}
}
p.stroke();
p.closePath();
//棋盘横线
p.beginPath();
for(let i = 0; i < 10; i++) {
	p.moveTo(w / 8 + 0.5, h * i + h / 9 + 0.5);
	p.lineTo(mapSize.width + w / 8 + 0.5, h * i + h / 9 + 0.5);
}
p.stroke();
p.closePath();
//绘制棋盘兵位 炮位的函数
function DrawPost(x, y) {
	p.beginPath();
	p.strokeStyle = "#000";
	//设置棋子字体大小 0.5rem  小平1rem
	if(innerWidth <= 700 && innerHeight > innerWidth) {
		p.lineWidth = 3;
		//map.style.marginTop = -(map.height)/2 + 'px';
	} else {
		p.lineWidth = 2;
	}
	//右
	if(x != 8) {
		//右上角
		p.moveTo(w * x + w / 8 + w * 0.08 + 0.5, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.2);
		p.lineTo(w * x + w / 8 + w * 0.08 + 0.5, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.08);
		p.lineTo(w * x + w / 8 + w * 0.25, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.08);
		//右下角
		p.moveTo(w * x + w / 8 + w * 0.08 + 0.5, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.2);
		p.lineTo(w * x + w / 8 + w * 0.08 + 0.5, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.08);
		p.lineTo(w * x + w / 8 + w * 0.25 + 0.5, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.08);
	} else {
		//空
	}
	//左 
	if(x == 0) {
		//空
	} else {
		//左上角
		p.moveTo(w * x + w / 8 - w * 0.08, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.2);
		p.lineTo(w * x + w / 8 - w * 0.08, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.08);
		p.lineTo(w * x + w / 8 - w * 0.25, (mapSize.height) / 9 * y + h / 9 + 0.5 + w * 0.08);
		//左下角
		p.moveTo(w * x + w / 8 - w * 0.08, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.2);
		p.lineTo(w * x + w / 8 - w * 0.08, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.08);
		p.lineTo(w * x + w / 8 - w * 0.25, (mapSize.height) / 9 * y + h / 9 + 0.5 - w * 0.08);

	}
	p.stroke();
	p.closePath();
}
//绘制兵位  炮位
//坐标从0开始 为偶数时 循环执行3行和6行兵位 ,为1、7绘制2、7行炮位
for(let i = 0; i < 9; i++) {
	if(i % 2 == 0) {
		DrawPost(i, 6);
		DrawPost(i, 3);
	} else if(i == 1 || i == 7) {
		DrawPost(i, 2);
		DrawPost(i, 7);
	} else {
		//空
	}
}
//绘制城中斜线
p.beginPath();
p.moveTo(funCoordinateX(3), funCoordinateY(7));
p.lineTo(funCoordinateX(5), funCoordinateY(9));
p.moveTo(funCoordinateX(5), funCoordinateY(7));
p.lineTo(funCoordinateX(3), funCoordinateY(9));

p.moveTo(funCoordinateX(3), funCoordinateY(2));
p.lineTo(funCoordinateX(5), funCoordinateY(0));
p.moveTo(funCoordinateX(5), funCoordinateY(2));
p.lineTo(funCoordinateX(3), funCoordinateY(0));
p.stroke();
p.closePath();
p.fillStyle = '#000';
//宽度小于700px 且竖屏 
if(innerWidth <= 700 && innerHeight > innerWidth) {
	//				map.style.top = '45%';
	p.font = `${w/2.5*1.5}px STxingkai`;
	map.style.marginTop = -(map.height) / 8 + 'px';
} else {
	p.font = `${w/2.5*1.6}px STxingkai`;
}
p.beginPath();
p.fillText('楚河', funCoordinateX(1), funCoordinateY(4.7));
p.fillText('汉界', funCoordinateX(6), funCoordinateY(4.7));
p.closePath();
//放置棋子
function PutChess() {
	if(innerWidth <= 700 && innerHeight > innerWidth) {
		p.font = `bold ${w/2.5*1.5}px 楷体`;
		//map.style.marginTop = -(map.height)/2 + 'px';
	} else {
		p.font = `bold ${w/2.5*1.3}px 楷体`;
	}
	//fillText坐标在左下角, 设置在中心点: 字体大小为0.5rem *0.5 再取半  行高微调(弃用  用内置textAlign方法)

	//绘制棋子:
	function drawChess() {
		//绘制棋子(圆与文字)
		for(let i = 0; i < Root.arrMap.length; i++) {
			if(Object.keys(Root.arrMap[i]).length !== 0) {
				//圆
				p.beginPath();
				p.shadowColor = 'rgba(0, 0, 0, 1)';
				p.shadowOffsetX = 4;
				p.shadowOffsetY = 3;
				p.shadowBlur = 10;
				if(Root.arrMap[i].t === 'b') {
					p.fillStyle = 'rgba(226,171,84,1)';
				} else if(Root.arrMap[i].t === 'r') {
					p.fillStyle = "rgba(255,160,122,1)";
				} else {
					//不存在的棋子
				}
				p.arc(funCoordinateX(Root.arrMap[i].xy[0]), funCoordinateY(Root.arrMap[i].xy[1]), w / 2.5 * 1.1, 0, 360 * Math.PI / 180);
				p.fill();
				p.closePath();
				//文字
				p.beginPath();
				if(Root.arrMap[i].t === 'b') {
					p.fillStyle = '#000';
				} else if(Root.arrMap[i].t === 'r') {
					p.fillStyle = '#f00';
				} else {
					//不存在的棋子
				}
				p.textAlign = 'center';
				p.textBaseline = 'middle';
				p.shadowColor = 'rgba(255, 255, 255, 0.8)';
				p.shadowOffsetX = -10;
				p.shadowOffsetY = -10;
				p.shadowBlur = 40;
				p.fillText(Root.arrMap[i].n, funCoordinateX(Root.arrMap[i].xy[0]), funCoordinateY(Root.arrMap[i].xy[1]));
				p.closePath();
			} else {
				//没有棋子
			}
		}

	}
	drawChess();
}

window.onload = function() {
	//放置棋子
	PutChess();

	//当前 选中的棋子
	let nowSelectedChess = null;
	map.addEventListener('click', function(e) {
		let eVent = e || event; //, mapSize.height * (0.12 / 2)
		//存储空的棋盘位置(索引 i)
		let arrEmptyMap = [];
		/*layerX是相对于当前对象(canvas)的坐标,和canvas显示坐标(屏幕像素)吻合,
		 *为了提高图像质量,棋盘与棋子实际大小被扩大,显示大小被缩小(canvas宽高与canvas的style宽高)
		 * 因为canvas宽高被扩大数倍,其内部坐标也被扩大了,而layerX是屏幕像素的坐标,所以下面需要再次换算下比例
		 * Root.canvasAndScreenRatio已赋值为 canvas真实大小与canvas屏幕显示大小比例(缩放倍数)
		 * funCoordinateX换算的值 是直接从左上角車位开始的 ,坐标(0,0)  所以eVent.layerX坐标系统也需要与其吻合
		 * mapSize.width * (0.12 / 2)为translate平移后偏移的坐标   w/8-0.5为初始绘制偏移的坐标  
		 */
		let x = eVent.layerX * Root.canvasAndScreenRatioWidth - mapSize.width * (0.12 / 2) - w / 8 - 0.5;
		let y = eVent.layerY * Root.canvasAndScreenRatioHeight - mapSize.height * (0.12 / 2) - h / 9 - 0.5;
		//alert(funCoordinateX(0))
		//alert(funCoordinateX(Root.arrMap[2].xy[0])+','+x)
		//console.log(`点击X${x}点击y${y}实际${funCoordinateX(Root.arrMap[0].xy[0])}实际Y${funCoordinateY(Root.arrMap[0].xy[1])}`);
		for(let i = 0; i < Root.arrMap.length; i++) {
			//如果存在棋子信息  说明有棋子  对其进行操作
			if(Object.keys(Root.arrMap[i]).length !== 0) {
				let chessX = funCoordinateX(Root.arrMap[i].xy[0]);
				let chessY = funCoordinateY(Root.arrMap[i].xy[1]);

				//点到圆心的距离 小于等于半径 说明点击到了圆形棋子内或圆形棋子上
				if(Math.pow(x - chessX, 2) + Math.pow(y - chessY, 2) <= Math.pow(w / 2.5 * 1.1, 2)) {
					console.log(JSON.stringify(Root.arrMap[i]) + '位置:' + i);
					//找到了  就把它赋给一个变量  且终止循环
					//多次点击都有棋子  也覆盖  保持只选中一个
					nowSelectedChess = Root.arrMap[i];
					console.log(nowSelectedChess);
					break;
				} else {
					//console.log('棋盘上')
				}
			} else {
				//棋盘所有空位  
				arrEmptyMap.push(i);
				//console.log(nowSelectedChess)
			}
		}
		// 如果有 棋子被选中  就移动到空位置
		if(nowSelectedChess != null) {
			//循环出之前存下的所有空位的下标i
			//根据其下标 计算出空位坐标  x,y(每行9个位置  把数组转换为行列)
			for(let iEmpty = 0; iEmpty < arrEmptyMap.length; iEmpty++) {
				// 排错发现行列赋值反了...  除取整为行  (y),取余为列(x)
				let iRowX = arrEmptyMap[iEmpty] % 9;
				let iColY = Math.floor(arrEmptyMap[iEmpty] / 9);
				//nowSelectedChess.xy[0];
				//nowSelectedChess.xy[1];
			
				console.log(arrEmptyMap);
				//当前点击坐标附近的空位  
				//同样  判断点击区域 是否在某个空位中心为坐标 w/2.5*1.1为半径构成的为圆形的范围内
				if(Math.pow(x - funCoordinateX(iRowX), 2) + Math.pow(y - funCoordinateY(iColY), 2) <= Math.pow(w / 2.5 * 1.1, 2)) {
					console.log('移动到:' + iRowX + ',' + iColY);
					//清空选中
					nowSelectedChess = null;
					break;
				} else {
					//console.log('棋盘其他空位')
				}
				//if(iEmpty==arrEmptyMap.length-1){
					console.log('['+iRowX+','+iColY+']');
				//}
			}
			
		} else {
			//alert(nowSelectedChess)
			//console.log('点击了棋盘空位,但还未选中棋子'+i);
		}
	});
	console.timeEnd('耗时');
}