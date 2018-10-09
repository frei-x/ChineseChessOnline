console.time('耗时');
/**
 *canvas出现毛边  一个是0.5px问题  一个是扩大canvas的宽高(提高分辨率)  再设置css进行缩放
 **/
"use strict"
let map = document.getElementById("map");
let box = document.getElementById("box");
let audioClick = document.getElementById("audioClick");
let audioGo = document.getElementById("audioGo");
let audioKill = document.getElementById("audioKill");
let audioEat = document.getElementById("audioEat");

/*
 *1rem=html根字体大小(px) ,getComputedStyle取出换算后 实际的px大小
 *chessR  棋子半径
 *
 *n:name,xy:转换后的坐标,t:red方或black方   
 *地图数组下标 i换算坐标,每行9个(0开始 一行数组长度为8 ): 9y + x = i,其中y为i除以9 取整,x为i除以9 的余数
 *													列 x = i-9y
 *													行 y = (i-x)/9
 * funRules 棋子走法规则,arrDead 已死亡棋子(被吃)
 */
let Root = {
	fontSize: parseFloat(getComputedStyle(document.documentElement, false)['fontSize']),
	chessR:null,
	funReDraw:null,
	arrReDraw:[],
	funRules:null,
	arrDead:[],
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
//Root.arrMap的副本,供属性拦截器用
//Root.arrMapCopy = Root.arrMap;
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
//计算borderWidth实际px大小
map.style.marginLeft = -parseFloat(map.style.width) / 2 - parseFloat(getComputedStyle(map,null).borderWidth) + 'px';
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
p.translate(mapSize.width * (0.12 / 2), mapSize.height * (0.12 / 2))
function funDrawMap(){
	p.beginPath();
	p.fillStyle = 'rgba(249,216,162,1)';
	p.fillRect(-mapSize.width * (0.12 / 2), -mapSize.height * (0.12 / 2), map.width, map.height);
	p.closePath();
	p.beginPath();
	p.strokeStyle = "#000";
	//棋盘 竖线
	//console.log(mapSize.width);
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
	p.beginPath();
	//恢复p.save()保存的样式,否则棋子的文字样式会叠加到楚河汉界文字上
	p.restore();
	p.fillStyle = '#000';
	//宽度小于700px 且竖屏 
	if(innerWidth <= 700 && innerHeight > innerWidth) {
		//				map.style.top = '45%';
		p.font = `${w/2.5*1.5}px STxingkai`;
		map.style.marginTop = -(map.height) / 8 + 'px';
	} else {
		p.font = `${w/2.5*1.6}px STxingkai`;
	}
	p.fillText('楚河', funCoordinateX(1), funCoordinateY(4.7));
	p.fillText('汉界', funCoordinateX(6), funCoordinateY(4.7));
	p.save();
	p.closePath();

}
//绘制棋盘 结束
//放置棋子
function funPutChess() {
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
		//console.table(Root)
		for(let i = 0; i < Root.arrMap.length; i++) {
			if(Object.keys(Root.arrMap[i]).length !== 0) {
				//圆
				p.beginPath();
//				if(innerWidth<750){
//					//
//				}else{
//					p.shadowColor = 'rgba(0, 0, 0, 1)';
//					p.shadowOffsetX = 4;
//					p.shadowOffsetY = 3;
//					p.shadowBlur = 10;					
//				}
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
//				if(innerWidth<750){
//					//
//				}else{
//					p.shadowColor = 'rgba(255, 255, 255, 0.8)';
//					p.shadowOffsetX = -10;
//					p.shadowOffsetY = -10;
//					p.shadowBlur = 40;
//				}

				p.fillText(Root.arrMap[i].n, funCoordinateX(Root.arrMap[i].xy[0]), funCoordinateY(Root.arrMap[i].xy[1]));
				p.closePath();
			} else {
				//没有棋子
			}
		}
	}
	drawChess();
}
//把所有绘制函数存入数组
Root.arrReDraw.push(funDrawMap,funPutChess);
//清除画布 重绘(重调所有绘图函数)
Root.funReDraw=function(){
	console.time('移动重绘');
	p.clearRect(-mapSize.width * (0.12 / 2), -mapSize.height * (0.12 / 2),map.width,map.height);	
	for(let i=0;i<Root.arrReDraw.length;i++){
		Root.arrReDraw[i]();
	}
	console.timeEnd('移动重绘');
}
/**
 * 棋子走法规则描述,传入当前棋子信息与目标位置信息  结合整个棋盘信息判断是否能够通行
 * 行棋时 判断目标位置是否在可行范围内(可行坐标存入数组) 通过返回true 否则false
 * 返回可行坐标 arrPracticable
 * {
 * 	bVerification:bVerification,
 * 	arrPracticable:arrPracticable
 * }
 * 
 */
Root.funRules=function(oNowSelectChess,oTager){
	//合并棋子兵种 (部分棋子走法相同 ).
	let oChess = oNowSelectChess;
	//验证(布尔值)
	let bVerification = false;
	let chessType = '';
	//可行坐标
	let arrPracticable = [];
	//棋子兵种判断  统一改为红棋名字,具体判断oNowSelectChess时 再判断其属于红方或黑方
	if(oChess.n=='相'||oChess.n=='象'){
		chessType='相';
	}else if(oChess.n=='士'||oChess.n=='仕'){
		chessType='士';
	}else if(oChess.n=='帥'||oChess.n=='將'){
		chessType='帥';
	}else if(oChess.n=='炮'||oChess.n=='砲'){
		chessType='炮';
	}else if(oChess.n=='兵'||oChess.n=='卒'){
		chessType='兵';
	}else if(oChess.n=='車'){
		chessType='車';
	}else if(oChess.n=='馬'){
		chessType='馬';
	}
	/*验证目标是否包含在可行范围*/
	function funComprise(practicable,tager){
		if(oTager){
			practicable.forEach(function(item,index){
				if(item[0]==tager.xy[0]&&item[1]==tager.xy[1]){
						bVerification = true;
					}else{
					//没找到
					}
				});		
		}else{
			//未传入目标
		}
	};
	switch (chessType){
		case '車':
					(function(){
						//横向与纵向 循环棋盘最大跨度
						//x+方向  y不变
						for(let x=1;x<9;x++){
							if(oChess.xy[0]+x<=8&&oChess.xy[0]+x>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+x+oChess.xy[1]*9].xy){
									//类型不同  允许该坐标添加
									if(Root.arrMap[oChess.xy[0]+x+oChess.xy[1]*9].t!=oChess.t){
										arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										//有棋子 停止后续添加
										break;
									}else{
										break;
									}
								}else{
									//空位置
									arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
								}
							}
							
						}
						//x-方向
						for(let x=1;x<9;x++){
							if(oChess.xy[0]-x<=8&&oChess.xy[0]-x>=0){
								if(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].xy){
									//类型不同  允许该坐标添加
									//alert(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].t+','+oChess.t)
									if(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].t!=oChess.t){
										arrPracticable.push([oChess.xy[0]-x,oChess.xy[1]]);
										//有棋子 停止后续添加
										break;
									}else{
										break;
									}
								}else{
									//空位置
									arrPracticable.push([oChess.xy[0]-x,oChess.xy[1]]);
								}
							}
							
						}
						//y+方向  , x轴不变
						for(let y=1;y<=9;y++){
							if(oChess.xy[1]+y<=9&&oChess.xy[1]+y>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].xy){
									//类型不同  允许该坐标添加
									if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].t!=oChess.t){
										arrPracticable.push([oChess.xy[0],oChess.xy[1]+y]);
										//不同阵营棋子 添加该位置后停止后续添加(可吃该棋子)
										break;
										//同阵营棋子,直接终止
									}else{
										break;
									}
								}else{
									//空位置
									arrPracticable.push([oChess.xy[0],oChess.xy[1]+y]);
								}
							}
							
						}
						//y-方向  , x轴不变
						for(let y=1;y<=9;y++){
							if(oChess.xy[1]-y<=9&&oChess.xy[1]-y>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].xy){
									//类型不同  允许该坐标添加
									if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].t!=oChess.t){
										arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
										//不同阵营棋子 停止后续添加
										break;
										//同阵营棋子,直接终止
									}else{
										break;
									}
								}else{
									//空位置
									//console.log(arrPracticable)
									arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
								}
							}
							
						}
						//检测目标位置是否在可行坐标中,判断数组相等
						funComprise(arrPracticable,oTager);
					})();
			break;
		case '馬':
				//验证马蹩脚,传入主方向的x或y,存入撇脚位置;
				let arrPoor = [];
				function funPoor(x,y){
					
					//马的朝向,大的那一个
						//x轴右移进一格或左移一格,y不变
						//+1  -1超范围判断必须分开... 否则影响另一组坐标的push
					if(x==-2&&oChess.xy[0]-2>=0){
						//转换为数组下标 验证该点是否有棋子阻挡,加入可行数组arrPracticable时 直接加x和y(两种)
						if(Root.arrMap[oChess.xy[0]-1+(oChess.xy[1]*9)].xy){
							arrPoor.push(Root.arrMap[oChess.xy[0]-1+(oChess.xy[1]*9)]);
						}else{
							//x-2方向   有y+1  y-1两种可能
							oChess.xy[1]-1>=0?arrPracticable.push([oChess.xy[0]-2,oChess.xy[1]-1]):null;
							oChess.xy[1]+1<=9?arrPracticable.push([oChess.xy[0]-2,oChess.xy[1]+1]):null;
							
						}
					}else if(x==2&&oChess.xy[0]+2<=8){
						if(Root.arrMap[(oChess.xy[0]+1)+(oChess.xy[1]*9)].xy){
							arrPoor.push(Root.arrMap[(oChess.xy[0]+1)+(oChess.xy[1]*9)]);
						}else{
							oChess.xy[1]-1>=0?arrPracticable.push([oChess.xy[0]+2,oChess.xy[1]-1]):null;
							oChess.xy[1]+1<=9?arrPracticable.push([oChess.xy[0]+2,oChess.xy[1]+1]):null;
						}
					}else if(y==-2&&oChess.xy[1]-2>=0){
						if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-1)*9].xy){
							arrPoor.push(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-1)*9]);
						}else{
							oChess.xy[0]-1>=0?arrPracticable.push([oChess.xy[0]-1,oChess.xy[1]-2]):null;
							oChess.xy[0]+1<=8?arrPracticable.push([oChess.xy[0]+1,oChess.xy[1]-2]):null;
						}
					}else if(y==2&&oChess.xy[1]+2<=9){
						if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+1)*9].xy){
							arrPoor.push(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+1)*9]);
						}else{
							oChess.xy[0]-1>=0?arrPracticable.push([oChess.xy[0]-1,oChess.xy[1]+2]):null;
							oChess.xy[0]+1<=8?arrPracticable.push([oChess.xy[0]+1,oChess.xy[1]+2]):null;
						}
					}
						
				};

				//(function(){
					//x或y只能有一个加2或减2,另一个加1或减1 ,共8个方向   跨度为2的方向验证蹩脚
					//let arrTowards = [-2,2]
					//四个主方向 (0仅为了占位)
						funPoor(2,0);
						funPoor(-2,0);
						funPoor(0,2);
						funPoor(0,-2);
					//arrPracticable可行坐标中范围可能超出棋盘 ,将超出的和同阵营棋子过滤
					//console.log(arrPracticable);
					arrPracticable=arrPracticable.filter(function(item,index,arr){
							return item[0]>=0&&item[0]<=8&&item[1]>=0&&item[1]<=9&&Root.arrMap[item[0]+item[1]*9].t!=oChess.t;
					});
					funComprise(arrPracticable,oTager);
					if(arrPoor.length==0){
						
					}else{
						console.error('马被以下位置撇脚:');
						console.log(arrPoor);
					};
					
				//})();
			break;
		case '相':
				(function(){
					let arrPoor = [];
					let arr = [[2,2],[2,-2],[-2,-2],[-2,2]];
					for(let i=0;i<arr.length;i++){
						// 当前棋子与可行位差值x y相加不得超出棋盘
						if(oChess.xy[0]+arr[i][0]<=8&&oChess.xy[0]+arr[i][0]>=0&&oChess.xy[1]+arr[i][1]<=9&&oChess.xy[1]+arr[i][1]>=0){
							//塞象眼
							if(Root.arrMap[oChess.xy[0]+arr[i][0]/2+(oChess.xy[1]+arr[i][1]/2)*9].xy){
								arrPoor.push([parseInt(arr[i][0]/2)+oChess.xy[0],parseInt(arr[i][1]/2)+oChess.xy[1]]);
							}else{
								//可行位置,原棋子位置+arr偏差(!!!下面数组数字类型怎么被转字符串了?)
								arrPracticable.push([oChess.xy[0]+arr[i][0],oChess.xy[1]+arr[i][1]]);
							}
						}else{
							//超出棋盘
						}
					}
					//过滤同阵营棋子位置/判断Y(item[1])不允许过河 
					arrPracticable=arrPracticable.filter(function(item,index,arr){
						if(oChess.t=='r'){
							return item[1]<=9&&item[1]>=5&&Root.arrMap[item[0]+item[1]*9].t!=oChess.t
						}else if(oChess.t=='b'){
							return item[1]<=4&&item[1]>=0&&Root.arrMap[item[0]+item[1]*9].t!=oChess.t
						}else{
							//未知数据
						}
					});
					funComprise(arrPracticable,oTager);
					if(arrPoor.length==0){
						
					}else{
						console.error('象被以下位置撇脚:');
						console.log(arrPoor);
					};
				})();
			break;
		case '士':
					(function(){
						let arr = [[1,1],[1,-1],[-1,-1],[-1,1]];
						for(let i=0;i<arr.length;i++){
							if(oChess.xy[0]+arr[i][0]<=5&&oChess.xy[0]+arr[i][0]>=3){
									if(oChess.t=='r'){
										oChess.xy[1]+arr[i][1]<=9&&oChess.xy[1]+arr[i][1]>=7?arrPracticable.push([oChess.xy[0]+arr[i][0],oChess.xy[1]+arr[i][1]]):null;
									}else if(oChess.t=='b'){
										oChess.xy[1]+arr[i][1]<=2&&oChess.xy[1]+arr[i][1]>=0?arrPracticable.push([oChess.xy[0]+arr[i][0],oChess.xy[1]+arr[i][1]]):null;
									}else{
										//未知数据
									}	

							}else{
								//x方向超出
							}
						}
					//移除同阵营棋子位置
					arrPracticable=arrPracticable.filter(function(item,index,arr){
						return Root.arrMap[item[0]+item[1]*9].t!=oChess.t;
					});
						
						funComprise(arrPracticable,oTager);
					})();
			break;
		case '帥':
					//统一验证x范围,再验证y 
					(function(){
						oChess.xy[0]+1<=5?arrPracticable.push([oChess.xy[0]+1,oChess.xy[1]]):null;
						oChess.xy[0]-1>=3?arrPracticable.push([oChess.xy[0]-1,oChess.xy[1]]):null;
							//if(oTager.xy[0]==oNowSelectChess.xy[0]){
								if(oNowSelectChess.t=='r'){
									for(let y=1;y<=9;y++){
										if(oChess.xy[1]-y<=9&&oChess.xy[1]-y>=0){
										//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
										//有棋子
											if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].n=='將'){
												//类型不同  允许该坐标添加到可行
													arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
													//不同阵营棋子 停止后续添加
													break;
													//同阵营棋子,直接终止
											}else{
												if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].xy){
													break;
												}
												//非將位置
												//console.log(arrPracticable)
												//arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
											}
										}
									}
								}else if(oNowSelectChess.t=='b'){
									for(let y=1;y<=9;y++){
										if(oChess.xy[1]+y<=9&&oChess.xy[1]+y>=0){
											if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].n=='帥'){
												//类型不同  允许该坐标添加到可行
													arrPracticable.push([oChess.xy[0],oChess.xy[1]+y]);
													//不同阵营棋子 停止后续添加
													break;
													//同阵营棋子,直接终止
											}else{
												//有棋子才终止循环,没棋子继续循环找到 对方将帥
												if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].xy){
													break;
												}
												//非將位置
												//console.log(arrPracticable)
												//arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
											}
										}
									}									
								}else{
									//未知阵营
								}
							//};
								if(oChess.t=='r'){
									oChess.xy[1]+1<=9?arrPracticable.push([oChess.xy[0],oChess.xy[1]+1]):null;
									oChess.xy[1]-1>=7?arrPracticable.push([oChess.xy[0],oChess.xy[1]-1]):null;
								}else if(oChess.t=='b'){
									oChess.xy[1]-1>=0?arrPracticable.push([oChess.xy[0],oChess.xy[1]-1]):null;
									oChess.xy[1]+1<=2?arrPracticable.push([oChess.xy[0],oChess.xy[1]+1]):null;
								}else{
									//未知数据
								};
					arrPracticable=arrPracticable.filter(function(item,index,arr){
						if(Root.arrMap[item[0]+item[1]*9]){
							return Root.arrMap[item[0]+item[1]*9].t!=oChess.t;
						}
					});
						funComprise(arrPracticable,oTager);
					})();
			break;
		case '炮':
					(function(){
						//横向与纵向 循环棋盘最大跨度
						//x+方向  y不变,bEat 可以吃子了  跳过越子这一次循环
						//各方向是否越子
						let bEat = {
							XPlush:false,
							XReduce:false,
							YPlush:false,
							YReduce:false
						};
						for(let x=1;x<9;x++){
							if(oChess.xy[0]+x<=8&&oChess.xy[0]+x>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+x+oChess.xy[1]*9].xy){
									
										
										//arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										//仅在有棋子 且已越过子停止这一次后续添加,没越子设置为越子
										if(!bEat.XPlush){
											bEat.XPlush = true;
											continue;
										}
										
								
								}else{
									//空位置 , 未越子时才添加到可行,越子后不能添加空位置
									if(!bEat.XPlush){
										arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
									}else{
										//越子了  不能再走空位
									}
								}
								//如果 越子,可以开始吃子了
								if(bEat.XPlush){
									//不是空的位置(发现棋子):
									if(Root.arrMap[oChess.xy[0]+x+oChess.xy[1]*9].xy){
										//不是同阵营  添加到可行位置数组
										 if(Root.arrMap[oChess.xy[0]+x+oChess.xy[1]*9].t!=oChess.t){
										 	 arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										 	 break;
										 }else{
										 	//同阵营
										 }
										 //不管是不是同阵营棋子 都停止搜索
										break;
									}
								}else{
									//未越子 不能开始吃子
								}
							}
							
						}
						//x-方向
						for(let x=1;x<9;x++){
							if(oChess.xy[0]-x<=8&&oChess.xy[0]-x>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].xy){
									
										
										//arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										//仅在有棋子 且已越过子停止这一次后续添加,没越子设置为越子
										if(!bEat.XReduce){
											bEat.XReduce = true;
											continue;
										}
										
								
								}else{
									//空位置 , 未越子时才添加到可行,越子后不能添加空位置
									if(!bEat.XReduce){
										arrPracticable.push([oChess.xy[0]-x,oChess.xy[1]]);
									}else{
										//越子了  不能再走空位
									}
								}
								//如果 越子,可以开始吃子了
								if(bEat.XReduce){
									//不是空的位置(发现棋子):
									if(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].xy){
										//不是同阵营  添加到可行位置数组
										 if(Root.arrMap[oChess.xy[0]-x+oChess.xy[1]*9].t!=oChess.t){
										 	 arrPracticable.push([oChess.xy[0]-x,oChess.xy[1]]);
										 	 break;
										 }else{
										 	//同阵营
										 }
										 //不管是不是同阵营棋子 都停止搜索
										break;
									}
								}else{
									//未越子 不能开始吃子
								}
							}
							
						}
						//y+方向  , x轴不变
						for(let y=1;y<=9;y++){
							if(oChess.xy[1]+y<=9&&oChess.xy[1]+y>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].xy){
									
										
										//arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										//仅在有棋子 且已越过子停止这一次后续添加,没越子设置为越子
										if(!bEat.YPlush){
											bEat.YPlush = true;
											continue;
										}
										
								
								}else{
									//空位置 , 未越子时才添加到可行,越子后不能添加空位置
									if(!bEat.YPlush){
										arrPracticable.push([oChess.xy[0],oChess.xy[1]+y]);
									}else{
										//越子了  不能再走空位
									}
								}
								//如果 越子,可以开始吃子了
								if(bEat.YPlush){
									//不是空的位置(发现棋子):
									if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].xy){
										//不是同阵营  添加到可行位置数组
										 if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]+y)*9].t!=oChess.t){
										 	 arrPracticable.push([oChess.xy[0],oChess.xy[1]+y]);
										 	 break;
										 }else{
										 	//同阵营
										 }
										 //不管是不是同阵营棋子 都停止搜索
										break;
									}
								}else{
									//未越子 不能开始吃子
								}
							}
							
						}
						//y-方向  , x轴不变
						for(let y=1;y<=9;y++){
							if(oChess.xy[1]-y<=9&&oChess.xy[1]-y>=0){
								//计算出可行位置(数组xy)在arrMap中的下标 找出该下标的信息
								//有棋子
								if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].xy){
									
										
										//arrPracticable.push([oChess.xy[0]+x,oChess.xy[1]]);
										//仅在有棋子 且已越过子停止这一次后续添加,没越子设置为越子
										if(!bEat.YReduce){
											bEat.YReduce = true;
											continue;
										}
										
								
								}else{
									//空位置 , 未越子时才添加到可行,越子后不能添加空位置
									if(!bEat.YReduce){
										arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
									}else{
										//越子了  不能再走空位
									}
								}
								//如果 越子,可以开始吃子了
								if(bEat.YReduce){
									//不是空的位置(发现棋子):
									if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].xy){
										//不是同阵营  添加到可行位置数组
										 if(Root.arrMap[oChess.xy[0]+(oChess.xy[1]-y)*9].t!=oChess.t){
										 	 arrPracticable.push([oChess.xy[0],oChess.xy[1]-y]);
										 	 break;
										 }else{
										 	//同阵营
										 }
										 //不管是不是同阵营棋子 越子后遇到棋子都停止搜索，且不能添加空位和同阵营
										break;
									}
								}else{
									//未越子 不能开始吃子
								}
							}
						}
						//检测目标位置是否在可行坐标中,判断数组相等
						funComprise(arrPracticable,oTager);
					})();
			break;
		case '兵':
					(function(){
						if(oChess.t=='r'){
							//前进方向（不管是否过河，都可以前进）
							oChess.xy[1]-1>=0?arrPracticable.push([oChess.xy[0],oChess.xy[1]-1]):null;
							//过河
							if(oChess.xy[1]>=0&&oChess.xy[1]<=4){
								oChess.xy[0]-1>=0?arrPracticable.push([oChess.xy[0]-1,oChess.xy[1]]):null;
								oChess.xy[0]+1<=8?arrPracticable.push([oChess.xy[0]+1,oChess.xy[1]]):null;
							}else{
								//未过河 不能左右
							}
						}else if(oChess.t=='b'){
							//前进方向（不管是否过河，都可以前进）
							oChess.xy[1]+1<=9?arrPracticable.push([oChess.xy[0],oChess.xy[1]+1]):null;
							//过河
							if(oChess.xy[1]>=5&&oChess.xy[1]<=9){
								oChess.xy[0]-1>=0?arrPracticable.push([oChess.xy[0]-1,oChess.xy[1]]):null;
								oChess.xy[0]+1<=8?arrPracticable.push([oChess.xy[0]+1,oChess.xy[1]]):null;
							}else{
								//未过河 不能左右
							}							
						}else{
							//未知阵营
						};
						funComprise(arrPracticable,oTager);
					})();
			break;
		default:console.error('棋子兵种异常');
			break;
	}
		console.log('可行位置:');
		console.log(arrPracticable);
		console.log('验证通过?:'+bVerification);
		console.log('全局信息:');
		console.log(Root.arrMap);
		return {
			bVerification:bVerification,
			arrPracticable:arrPracticable		
		}
}
//拦截对象属性时  enumerable可枚举属性最好定义上,否则:
/**
 *  for..in循环
 *  Object.keys方法
 *  JSON.stringify方法都取不到该属性,enumerable为false时,该属性会'隐身'
 *  没设置get的return, 被defineProperty的属性值会为undefined
 */
// Object.defineProperty(Root,'arrMap',{
// 	configurable: true,
// 	get:function(data){
// 		return Root.arrMapCopy
// 	},
// 	set:function(data){
// 		alert(222)
// 		Root.funReDraw();
// 	},
// 	enumerable:true
// });
window.onload = function() {
	let socket = io();
	//绘制棋盘
	//funDrawMap();
	//放置棋子
	//funPutChess();
	Root.funReDraw();

	//当前 选中的棋子
	let nowSelectedChess = null;
	//当前游戏状态 0:和棋,1:红行棋,2:黑行棋,10:红胜,20:黑胜
	let nowGameState = 1 ;
	map.addEventListener('click', function(e) {
		let eVent = e || event; //, mapSize.height * (0.12 / 2)
		//存储空的棋盘位置(索引 i)
		let arrEmptyMap = [];
		//存储棋子移动目标坐标 和map数组索引(其实根据索引就可以算出坐标xy,为了方便 都记录)
		let target ={
			xy:null,
			index:null,
		};
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
						audioClick.play();
					// 1 红棋 走子  2黑棋走子
					if(nowGameState==1){
						if(nowSelectedChess==null){
							if(Root.arrMap[i].t==='r'){
								nowSelectedChess = Root.arrMap[i];
							}else{
								//不为红棋
								console.error('不是红棋')
							}
						}else{
							if(Root.arrMap[i].t!='r'){
								//不属于己方阵营  就不覆盖上次选中的棋子,直接吃掉
								//alert('不属于己方1'+Root.arrMap[i].t);
								funMoveChess(Root.arrMap[i]);
								audioEat.play();
								
							}else{
								//同阵营棋子,继续覆盖选中
								nowSelectedChess = Root.arrMap[i];
							}
						}	
						//console.log(nowSelectedChess);
						break;
					}else if(nowGameState==2){
						if(nowSelectedChess==null){
							if(Root.arrMap[i].t==='b'){
								nowSelectedChess = Root.arrMap[i];
							}else{
								//不为黑棋
								console.error('不是黑棋');
							}
						}else{
							if(Root.arrMap[i].t!='b'){
								//不属于己方阵营  就不覆盖上次选中的棋子,直接吃掉
								//alert('不属于己方2'+Root.arrMap[i].t)
								funMoveChess(Root.arrMap[i]);
								audioEat.play();
							}else{
								//同阵营棋子,继续覆盖选中
								nowSelectedChess = Root.arrMap[i];
							}
						}
						
						break;
					}
					console.log(JSON.stringify(Root.arrMap[i]) + '位置:' + i);
					//找到了  就把它赋给一个变量  且终止循环
					//多次点击都有棋子  也覆盖  保持只选中一个
					//棋子为空  就选中,如果已选中 就判断已选中的的棋子与即将选中的棋子阵营是否属于己方
					
				} else {
					//console.log('非空位  但未点击到棋子上')
				}
			} else {
				//棋盘所有空位  
				  arrEmptyMap.push(i);
				//console.log(nowSelectedChess)
			}
			//arrEmptyMap.push(i);
		}
		//↑ Root.arrMap.length循环结束
//		for(let a=0;a<90;a++){
//			arrEmptyMap.push(a);
//		}
		// 如果有 棋子被选中  就移动到空位置  //吃子时 传入目标不传入目标为空棋盘(供前面选子时 不属于己方阵营  就不覆盖上次选中的棋子,直接吃掉)
		function funMoveChess(tagerChess){
			if(nowSelectedChess != null) {
				//audioMove.play();
				//循环出之前存下的所有空位的下标i
				//根据其下标 计算出空位坐标  x,y(每行9个位置  把数组转换为行列)  90 次 遍历棋盘每个位置
				for(let iEmpty = 0; iEmpty < 90; iEmpty++) {
					// 排错发现行列赋值反了...  除取整为行  (y),取余为列(x)
					let iRowX;
					let iColY;
					if(tagerChess){
						iRowX = tagerChess.xy[0];	
						iColY = tagerChess.xy[1];
					}else{
						iRowX = arrEmptyMap[iEmpty] % 9;	
						iColY = Math.floor(arrEmptyMap[iEmpty] / 9);
					}
					
					//nowSelectedChess.xy[0];
					//nowSelectedChess.xy[1];
				
					//console.log(arrEmptyMap);
					//当前点击坐标附近的空位  
					//同样  判断点击区域 是否在某个空位中心为坐标 w/2.5*1.1为半径构成的为圆形的范围内
					if(Math.pow(x - funCoordinateX(iRowX), 2) + Math.pow(y - funCoordinateY(iColY), 2) <= Math.pow(w / 2.5 * 1.1, 2)) {
						//存入目标位置信息:
						if(tagerChess){
							target.xy = [tagerChess.xy[0],tagerChess.xy[1]];
							target.index = Root.arrMap.indexOf(tagerChess);	
						}else{
							target.xy = [iRowX,iColY];
							target.index =arrEmptyMap[iEmpty];							
						}
						if(!Root.funRules(nowSelectedChess,target).bVerification){
							console.error('棋子走法不符合规则');
							//置空选中
							nowSelectedChess=null;
							break;
						}else{
							//合乎规则,走法在可行范围
							//之前的棋子对象清空,在Root.arrMap中找到原来棋子的索引
							//Root.arrMap[Root.arrMap.indexOf(nowSelectedChess)] = {};!!! indexOf可以查数组中的对象,二维数组却不行 
							//console.log(JSON.stringify(Root.arrMap[nowSelectedChess.xy[0]+nowSelectedChess.xy[1]*9]));
							Root.arrMap[nowSelectedChess.xy[0]+nowSelectedChess.xy[1]*9] = {};
							//console.log(JSON.stringify(Root.arrMap[nowSelectedChess.xy[0]+nowSelectedChess.xy[1]*9]));
							//alert(Root.arrMap.indexOf(nowSelectedChess));
							//目标位置xy 给之前被选中的棋子的xy
							//同时把棋子移动到数组相应索引位置
							let nSCX = nowSelectedChess.xy[0];
							let nSCY = nowSelectedChess.xy[1];
							let diffX = iRowX - nSCX;
							let diffY = iColY - nSCY;
							let count = 10;
							let nowCount = 1;
							function moveAnimation(){
								//  如果不满足条件 棋子 继续移动(动画), 满足条件:切换行棋/游戏状态  , 清空选中
								if(nowCount>count){
									if(nowSelectedChess.t==='r'){
										nowGameState = 2;
									}else if(nowSelectedChess.t==='b'){
										nowGameState = 1;
									}
//									else if(nowGameState==0){
//										//和棋
//									}else if(nowGameState==10){
//										//红胜
//									}else if(nowGameState==20){
//										//黑胜
//									}else{
//										//异常数据
//									}
									audioGo.play();
									nowSelectedChess = null;
								}else{
									//console.log(nowSelectedChess);
									nowSelectedChess.xy = [nSCX+diffX*(nowCount/count),nSCY+diffY*(nowCount/count)];
								//	alert((diffY/count)*(nowCount/count))
									Root.arrMap[target.index] = nowSelectedChess;
									Root.funReDraw();
									requestAnimationFrame(moveAnimation);
									nowCount++;
								}
							}
							if(Object.keys(Root.arrMap[target.index]).length==0){
								// 移动了 但未吃子(目标空对象)
							}else{
								//记录哪些棋子被吃
								Root.arrDead.push(Root.arrMap[target.index]);
								if(Root.arrDead[Root.arrDead.length-1].n=='帥'){
									nowGameState = 20;
								}else if(Root.arrDead[Root.arrDead.length-1].n=='將'){
									nowGameState = 10;
								}
							}
							console.log('以下棋子已阵亡:');
							console.log(Root.arrDead);
							moveAnimation();
							console.log('移动到'+JSON.stringify(target));
							//Root.funReDraw();
							//console.log(Root.arrMap);
							break;
						}

					} else {
						//console.log('棋盘其他空位')
					}
					//if(iEmpty==arrEmptyMap.length-1){
						//console.log('['+iRowX+','+iColY+']');
					//}
				}
				
			} else {
				//alert(nowSelectedChess)
				//console.log('点击了棋盘空位,但还未选中棋子'+i);
			}
						
		}
		funMoveChess();
	},false);
	console.timeEnd('耗时');
}