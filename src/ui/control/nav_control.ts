// @flow

import DOM from '../../util/dom';
import { extend, bindAll } from '../../util/util';
import DragRotateHandler from '../handler/drag_rotate';

import type Map from '../map';

type Options = {
    showCompass?: boolean,
    showZoom?: boolean,
	position?: string
};

const defaultOptions: Options = {
    showCompass: true,
    showZoom: true,
	position : 'bottom-right'
};

/**
 * A `NavigationControl` control contains zoom buttons and a compass.
 *
 * @implements {IControl}
 * @param {Object} [options]
 * @param {Boolean} [options.showCompass=true] If `true` the compass button is included.
 * @param {Boolean} [options.showZoom=true] If `true` the zoom-in and zoom-out buttons are included.
 * @example
 * var nav = new mapabcgl.NavigationControl();
 * map.addControl(nav, 'top-left');
 * @see [Display map navigation controls](http://www.mapabc.com/mapabc-gl-js/example/navigation/)
 * @see [Add a third party vector tile source](http://www.mapabc.com/mapabc-gl-js/example/third-party/)
 */
class NavControl {
    _map: Map;
    options: Options;
    _container: HTMLElement;
	
    _nav_container: HTMLElement;
    
	_zoomInButton: HTMLElement;
    _zoomOutButton: HTMLElement;
    
	
	_amapControlbar:HTMLElement;
	
	_amapLuopan : HTMLElement;
	_amapLuopanBG : HTMLElement;
	_amapCompass : HTMLElement;
	_amapPointers : HTMLElement;
	
	_amapPitchUp : HTMLElement;
	_amapPitchDown : HTMLElement;
	
	_amapRotateLeft : HTMLElement;
	_amapRotateRight : HTMLElement;
	
	_compass: HTMLElement;
    _compassArrow: HTMLElement;
    _handler: DragRotateHandler;
    _amapHandler: DragRotateHandler;
	
	_intervalFunc:any;

    constructor(options: Options) {
		
		const this_ = this;
		
        this.options = extend({}, defaultOptions, options);
        this._container = DOM.create('div', 'mapabcgl-ctrl mapabcgl-ctrl-group');

        this._nav_container = DOM.create('div', 'mapabcgl-scalebox zdeps-1 usel', this._container );
		
        this._container.addEventListener('contextmenu', (e) => e.preventDefault());
        this._nav_container.addEventListener('contextmenu', (e) => e.preventDefault());

        if (this.options.showZoom) {
            this._zoomInButton = this._createDiv('zoom_map zoom_in_map', 'Zoom In', () => this._map.zoomIn());
            this._zoomOutButton = this._createDiv('zoom_map zoom_out_map', 'Zoom Out', () => this._map.zoomOut());
        }
        if (this.options.showCompass) {
            bindAll([
                '_rotateCompassArrow'
            ], this);
            //this._compass = this._createButton('mapabcgl-ctrl-icon mapabcgl-ctrl-compass', 'Reset North', () => this._map.resetNorth());
			
            //this._compassArrow = DOM.create('span', 'mapabcgl-ctrl-compass-arrow', this._compass);
			
			/**
			高德样式罗盘
			**/
			
			//罗盘容器div
			this._amapControlbar = DOM.create('div', 'amap-controlbar', this._container);
			
			
			
			this._amapLuopan =  DOM.create('div', 'amap-luopan', this._amapControlbar);
			
			this._amapLuopanBG = DOM.create('div','amap-luopan-bg',this._amapLuopan);
			
			this._amapCompass = DOM.create('div','amap-compass',this._amapLuopan);
			
			///罗盘指针
			this._amapPointers = DOM.create('div','amap-pointers',this._amapCompass);
			//指针点击还原地图事件
			this._amapPointers.addEventListener('click', () => this._map.easeTo({bearing:0,pitch:0,duration:1000,animate:true}));
			
			
			///倾斜角度控制按钮
			this._amapPitchUp = DOM.create('div','amap-pitchUp',this._amapLuopan);
			//this._amapPitchUp.addEventListener('click', () => this._map.easeTo({pitch:this._map.getPitch()+10,duration:1000,animate:true}));
			this._amapPitchUp.addEventListener('mousedown',function(ev){
				this_._intervalFunc = setInterval(function(){
					if(this_._map.getPitch()==60){
						clearInterval(this_._intervalFunc);
					}else{
						this_._map.easeTo({pitch:this_._map.getPitch()+5,duration:100,animate:true})
					}
				},50);
			});
			this._amapPitchUp.addEventListener('mouseup',function(ev){
				clearInterval(this_._intervalFunc);
			});
			this._amapPitchUp.addEventListener('mouseleave',function(ev){
				clearInterval(this_._intervalFunc);
			});
			
			
			this._amapPitchDown = DOM.create('div','amap-pitchDown',this._amapLuopan);
			//this._amapPitchDown.addEventListener('click', () => this._map.easeTo({pitch:this._map.getPitch()-5,duration:100,animate:true}));
			this._amapPitchDown.addEventListener('mousedown',function(ev){
				this_._intervalFunc = setInterval(function(){
					if(this_._map.getPitch()==0){
						clearInterval(this_._intervalFunc);
					}else{
						this_._map.easeTo({pitch:this_._map.getPitch()-5,duration:100,animate:true})
					}
				},50);
			});
			this._amapPitchDown.addEventListener('mouseup',function(ev){
				clearInterval(this_._intervalFunc);
			});
			this._amapPitchDown.addEventListener('mouseleave',function(ev){
				clearInterval(this_._intervalFunc);
			});

			//旋转角度控制按钮-逆时针
			this._amapRotateLeft = DOM.create('div','amap-rotateLeft',this._amapLuopan);
			//this._amapRotateLeft.addEventListener('click', () => this._map.easeTo({bearing:this._map.getBearing()+10,duration:1000,animate:true}));
			this._amapRotateLeft.addEventListener('mousedown',function(ev){
				this_._intervalFunc = setInterval(function(){
						this_._map.easeTo({bearing:this_._map.getBearing()+10,duration:100,animate:true})
				},50);
			});
			this._amapRotateLeft.addEventListener('mouseup',function(ev){
				clearInterval(this_._intervalFunc);
			});
			this._amapRotateLeft.addEventListener('mouseleave',function(ev){
				clearInterval(this_._intervalFunc);
			});
			
			//旋转角度控制按钮-顺时针
			this._amapRotateRight = DOM.create('div','amap-rotateRight',this._amapLuopan);
			//this._amapRotateRight.addEventListener('click', () => this._map.easeTo({bearing:this._map.getBearing()-10,duration:1000,animate:true}));
			this._amapRotateRight.addEventListener('mousedown',function(ev){
				this_._intervalFunc = setInterval(function(){
						this_._map.easeTo({bearing:this_._map.getBearing()-10,duration:100,animate:true})
				},50);
			});
			this._amapRotateRight.addEventListener('mouseup',function(ev){
				clearInterval(this_._intervalFunc);
			});
			this._amapRotateRight.addEventListener('mouseleave',function(ev){
				clearInterval(this_._intervalFunc);
			});
			
        }
    }

    _rotateCompassArrow() {
        const rotate = `rotate(${this._map.transform.angle * (180 / Math.PI)}deg)`;
        //this._compassArrow.style.transform = rotate;
		
		// 设置罗盘旋转角度和倾斜角度
		const amapRotate = `rotateX(${this._map.transform._pitch * (180 / Math.PI)}deg) rotateZ(${this._map.transform.angle * (180 / Math.PI)}deg)`;
		this._amapCompass.style.transform = amapRotate;
    }

    onAdd(map: Map) {
        this._map = map;
        if (this.options.showCompass) {
            this._map.on('rotate', this._rotateCompassArrow);
            this._map.on('pitch', this._rotateCompassArrow);
            this._rotateCompassArrow();

            this._handler = new DragRotateHandler(map, {button: 'left', element: this._amapCompass});
            DOM.addEventListener(this._amapCompass, 'mousedown', this._handler.onMouseDown);
            this._handler.enable();
			
			this._calcContainerStyle();
        }
        return this._container;
    }

    onRemove() {
        DOM.remove(this._container);
        if (this.options.showCompass) {
            this._map.off('rotate', this._rotateCompassArrow);
            DOM.removeEventListener(this._amapCompass, 'mousedown', this._handler.onMouseDown);
            this._handler.disable();
            delete this._handler;
		
        }

        delete this._map;
    }
	
	getDefaultPosition() {
		return this.options.position;
	}
	
	_calcContainerStyle() {
		if(this.options.position == 'bottom-right'){
			this._amapControlbar.style.right='-16px';
			this._amapControlbar.style.bottom='-32px';
			this._container.style.margin='0 20px 40px 0';	
		}else if(this.options.position == 'top-right'){
			this._amapControlbar.style.right='-16px';
			this._amapControlbar.style.bottom='-200px';
			this._container.style.margin='20px 20px 0px 0';	
		}else if(this.options.position == 'bottom-left'){

			this._container.style.margin='0 0 10px 20px';
			this._amapControlbar.style.left='-85px';
			this._amapControlbar.style.bottom='-33px';
			this._amapRotateRight.style.right = '-48px';
			this._amapCompass.style.left = '93px';
			this._amapPitchDown.style.margin = '12px';
			this._amapPitchUp.style.margin = '0px';
			this._amapPitchUp.style.left = '78%';

		}else if(this.options.position == 'top-left'){

			this._container.style.margin='20px 0 10px 20px';
			this._amapControlbar.style.left='-95px';
			this._amapControlbar.style.top='87px';
			this._amapRotateRight.style.right = '-35px';
			this._amapCompass.style.left = '93px';

			this._amapPitchDown.style.margin = '0 12px';
			this._amapPitchUp.style.margin = '0px';
			this._amapPitchUp.style.left = '70%';
		}
	}
	
    _createButton(className: string, ariaLabel: string, fn: any) {
        const a = DOM.create('button', className, this._container);
        a.type = 'button';
        a.setAttribute('aria-label', ariaLabel);
        a.addEventListener('click', fn);
        return a;
    }
    _createDiv(className: string, ariaLabel: string, fn: any) {
        const a = DOM.create('div', className, this._nav_container);
        a.addEventListener('click', fn);
        return a;
    }
}

export default NavControl;
