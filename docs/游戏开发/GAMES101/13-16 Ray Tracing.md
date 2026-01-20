来源：
[GAMES101（现代计算机图形学入门）笔记 - Yu_Tang](https://tanyuu.github.io/2024.01-07/GAMES101%E7%AC%94%E8%AE%B0/#lecture-16-ray-tracing-4%E5%85%89%E7%BA%BF%E8%BF%BD%E8%B8%AA4-%E8%92%99%E7%89%B9%E5%8D%A1%E6%B4%9B%E7%A7%AF%E5%88%86%E5%92%8C%E8%B7%AF%E5%BE%84%E8%BF%BD%E8%B8%AA)
光线追踪的不同于光栅化的一种成像方式，解决了光栅化对全局效果的问题（软阴影、Glossy 反射（金属反射）、间接光照）；光栅化可以认为是一种快速的、近似的成像方式；

光线可以有如下假设：
1. 在均匀介质中直线传播，不考虑波动性；
2. 光线间不考虑碰撞；
3. 光线从光源发出，最终进入相机；也可以认为从相机发出光线，反向传播最终进入光源（光路可逆）；

## 1 Whitted风格光线追踪（Whitted-Style Ray Tracing）
从相机出发，针对每个像素发出一条感知光线（camera ray / primary ray），直至与其相交的第一个三角面；在这个交点上判断对光源的可见性（阴影）（shadow ray），并考虑在此处发生的反射（和折射）；沿反射方向继续发出感知光线（secondary ray），重复此过程；
![[Pasted image 20251105143520.png|500]]
在这个过程中，需要考虑求交、能量损失等若干技术问题；
### 1.1 射线-表面交点（Ray-surface Intersection）
光线认为是从起点 $O$ ，向方向 $d$ 传播的射线，有参数表示 $r(t)=o+td$，$(0⩽t<∞)$ ；
#### 1.1.1 球
c 为球心，半径 R 的球有定义
$$p:(p-c)^2-R^2=0$$
与光线参数表示联立有
$$(o+td-c)^2-R^2=0$$
只有 $t$ 为未知量，解得
$$
\begin{align}
a&=d\cdot d\\
b&=2(o-c)\cdot d\\
c&=(o-c)\cdot(o-c)-R^2\\
t&={-b \pm \sqrt{b^2-4ac}\over 2a},t\in\mathbb{R},t\geqslant0
\end{align}
$$
#### 1.1.2 隐式表面（Implicit Surface）
隐式表面有定义 $p:f(p)=0$
光线参数表示代入有 $f(o+td)=0$
解出正实根即可；
#### 1.1.3 平面
平面可以由法线 N 和平面上一点 $p’$ 定义，定义有 $p:(p-p')\cdot N=0$ ；
联立有
$$(o+td-p')\cdot N=0\\
t={(p'-o)\cdot N \over d\cdot N}$$
解出正实根即可；
#### 1.1.4 轴向平面
轴向平面只需要用与其垂直的坐标轴的坐标值即可定义；
以与 x 轴垂直的平面为例，有
$$t={p'_x-o_x\over d_x}$$
#### 1.1.5 三角形网格
光线与三角形的交点还可以判断光源是否在物体内；

先判断光线和三角形所在平面求交，再判断点是否在三角形内；也可以通过重心坐标直接得到（Möller Trumbore Algorithm）；

对于方程

$$O+tD=(1-b_1-b_2)P_0+b_1P_1+b_2P_2 \tag{1}$$

定义

$$
\begin{align}
E_1=P_1-P_0\\
E_2=P_2-P_0\\
S=O-P_0\\
S_1=D\times E_2\\
S_2=S\times E_1\\
\end{align}
$$

有解

$$\begin{bmatrix}
t\\
b_1\\
b_2
\end{bmatrix}
={\frac 1{S_1\cdot E_1}}
\begin{bmatrix}
S_2\cdot E_2\\
S_1\cdot S\\
S_2\cdot D
\end{bmatrix}\tag{2}$$
**怎么得到这个解的呢?下面给出我的理解**
本质上看这其实就相当于三元的线性方程组,先进行变形
令
$$
\begin{align}
E_1=P_1-P_0\\
E_2=P_2-P_0\\
S=O-P_0\\
\end{align}
$$
则原本的方程(1)可以变形为
$$
tD-b_{1}E_{1}-b_2 E_2=S
$$
用矩阵表示就是
$$
\begin{bmatrix}
D&-E_1&-E_2
\end{bmatrix}
\begin{bmatrix}
t\\ b_1\\ b_2
\end{bmatrix}
=S
$$
根据[[克莱姆法则|克莱姆法则]]，
$$
t=
\frac{
\begin{vmatrix}
S & -E_1 & -E_2 
\end{vmatrix}
}{
\begin{vmatrix}
D & -E_1 & -E_2 
\end{vmatrix}
}
$$
$$
b_1=
\frac{
\begin{vmatrix}
D & S & -E_2 
\end{vmatrix}
}{
\begin{vmatrix}
D & -E_1 & -E_2 
\end{vmatrix}
}
$$
$$
b_2=
\frac{
\begin{vmatrix}
D & -E_1 & S 
\end{vmatrix}
}{
\begin{vmatrix}
D & -E_1 & -E_2 
\end{vmatrix}
}
$$
因此
$$
\begin{bmatrix}
t\\
b_1\\
b_2
\end{bmatrix}
=\frac{1}{
\begin{vmatrix}
D & -E_1 & -E_2 
\end{vmatrix}
}\times
\begin{bmatrix}
\begin{vmatrix} S & -E_1 & -E_2 \end{vmatrix}\\
\begin{vmatrix} D & S & -E_2 \end{vmatrix}\\
\begin{vmatrix} D & -E_1 & S \end{vmatrix}
\end{bmatrix}\tag{3}
$$
公式2其实和公式3是等价的
因为行列式
$$
\begin{vmatrix}
D & -E_1 & -E_2 
\end{vmatrix}=(D\times E_1)\cdot E_2
$$
依次类推，其他的行列式也能用向量叉乘和点乘来计算，于是就能把(3)转化为(2)
### 1.2 加速求交过程
对于光线和一个模型（场景）求交，朴素想法即为枚举面片进行计算，取 t 最小非负值，此种方法消耗很大，考虑加速这一过程；

加速结构的建立是在光线追踪之前；
#### 1.2.1 包围盒（Bounding Volumes）
用简单集合体将模型包围，如果一个光线与包围盒没有交，那么其与包围盒内物体也没有交；
对于轴向对齐包围盒（AABB），可以认为其是三对平面所夹的空间；
考虑光线和包围盒求交过程；当光线与三组对面中的任何一个面均有交点时，认为光线进入包围盒，当光线穿过任何的两个平面时，认为光线离开包围盒；

对于每一对面，分别计算 $t_{min},t_{max}$（无论正负），光线关于包围盒的进入点有 $t_{enter}=\max\{t_{min}\}$ ，离开点有 $t_{exit}=\min\{t_{max}\}$ ；

- 如果 $t_{exit}<0$ ，我们认为包围盒在光线后，与光线没有交点；
- 如果 $t_{exit}\geqslant0,t_{enter}<0$ ，我们认为光源在包围盒中；
总地来说，如果 $t_{enter}<t_{exit}，t_{exit}\geqslant0$ ，我们认为光线与包围盒有交点；
#### 1.2.2 均匀网格(Uniform grids)
对场景求出包围盒后，将包围盒分为若干均等的小格子，对于包含物体表面的格子进行标记；

沿射线轨迹遍历网格，对于遍历到的每个格子，测试射线与格子内对象的相交性，如果相交即停止，意味着找到了第一个交点。
![[Pasted image 20251105172341.png|400]]
格子划分密度上有经验 $\#cells = C * \#objs,\  C\approx27\text{ in 3D}$
在几何体分布较为均匀的场景优化效果较好；否则容易出现"Teapot in a stadium(体育场里的茶壶)" problem；
#### 1.2.3 空间划分(Spatial Partitions)
以 KD-Tree 为例详细说明；
![[Pasted image 20251105172617.png|400]]
##### 八叉树（Oct-Tree）
对空间进行轴向划分，将每个节点进行八分割存储在子结点中，划分至子结点中有足够少的物体；
##### KD-Tree
不同于八叉树，每次只对节点进行一次轴向划分，不对于父子节点进行相同轴向的划分（三维上沿 x ，y ，z 方向上循环），同样直至子结点中有足够少的物体；

**只需要在叶子节点存储模型；**
在判断时，先判断与根节点是否存在交点，如果有交点则判断与两子节点是否存在交点；直至叶子节点，如果仍有交点则判断其与节点内部模型是否有交点；
KD-Tree 的主要问题是难以判断格点与哪些模型相交；此外，如果一个物体与多个叶子节点相交，其会被存储多份；
##### BSP-Tree
不同于KD-Tree进行轴向划分，对节点进行更自由的二分；

#### 1.2.4 物体划分(Object Partitions)
##### BVH（Bounding Volume Hierarchy）树
BVH树对物体进行划分，如图所示，直至划分至子结点中有足够少的三角形；
![[Pasted image 20251105173115.png|500]]
BVH树解决了 KD-Tree 的两大问题；

其存在的问题是节点包围盒可能相交，影响有限；实际上会保证重叠部分尽量少；

关于如何划分节点：

1. 类似 KD-Tree ，可以循环使用不同的轴向；也可以选择包围盒最长的一条轴进行划分；
2. 对于如何划分两半，可以将三角形的重心按分割轴向排序，取中位三角形进行分隔，使得两部分三角形数量均匀，降低资源消耗；
    寻找中位数不需要排序，可以转化为top-k大数问题，通过快速选择算法在线性复杂度内解决；
在场景变化时，需要重新计算BVH树；

与 KD-Tree 类似，在中间节点只存储包围盒和子节点指针，只在叶子节点存储分割后的模型；
光线求交过程也与 KD-Tree 类似，有伪代码
```cpp
Intersect (Ray ray, BVH node) {  
	if (ray misses node.bbox) return;  
	  
	if (node is a leaf node)  
	{  
	test intersection with all objs;  
	return closest intersection;  
	}  
	  
	hit1 = Intersect(ray, node.child1);  
	hit2 = Intersect(ray, node.child2);  
	return the closer of hit1, hit2;  
}
```
## 2 辐射度量学(Ray Tracing)
辐射度量学是一种精确定义光与物体表面作用的工具，是路径追踪的基础；

辐射度量学同样着眼于光的几何属性，忽略波动性；

辐射度量学通过辐射通量（Radiant flux）、强度（Intensity）、照度（Intensity）、亮度（Radiance）等属性描述光，下述均使用英文；
### 2.1 概念
#### 2.1.1 Radiant Energy
Radiant Energy 是电磁辐射的能量，以焦耳（J）表示；
$$Q[\text{J=Joule}]$$
#### 2.1.2 Radiant Flux(Power)
Radiant Flux 是电磁辐射的功率，单位时间的能量，也可以被度量为单位时间内辐射出的光子数量，以瓦特（W）或流明（lm）表示；
$$\Phi =\frac {\mathrm{d}\Phi}{\mathrm{d}t}[\text{W=Watt}][\text{lm=lumen}]$$
_现代11W LED灯约815lm，等价于60W白炽灯；_
#### 2.1.3 立体角(Solid Angle)
类比于角度 $\theta =\frac lr$ ，圆上有 $2\pi$ 角（radians）
![[Pasted image 20251105183927.png|400]]
立体角是角度的三维延伸，$\Omega=\frac A{r^2}$ ，球上有 $4\pi$ 立体角（steradians）；
![[Pasted image 20251105183952.png|400]]
#### 2.1.4 Radiant Intensity
(Radiant) Intensity 是对光源方向上功率的度量，每单位立体角的功率，以坎德拉（cd）表示；
$$I(\omega) =\frac {\mathrm{d}\Phi}{\mathrm{d}\omega}[\frac {\text{W}}{\text{sr}}][\frac {\text{lm}}{\text{sr}}\text{=cd=candela}]$$
单位立体角可以由天顶角 $\theta$ （与 z 轴夹角）和方向角 $\phi$ （绕 z 轴旋转的角度）定义；
![[Pasted image 20251105184558.png|400]]
$$
\begin{align}
\mathrm{d}A&=(r\mathrm{d}\theta)(r\sin\theta\mathrm{d}\phi)\\
&=r^2\sin\theta\text{ }\mathrm{d}\theta\mathrm{d}\phi\\
\mathrm{d}\omega &=\frac{\mathrm{d}A}{r^2}=\sin\theta\text{ }\mathrm{d}\theta\mathrm{d}\phi\\
I&=\frac {\Phi}{4\pi}
\end{align}
$$
$\omega$ 可以作为方向向量
#### 2.1.5 Irradiance
Irradiance 是对物体表面单位面积接收到光的功率的度量；
$$E(x)\equiv\frac{\mathrm{d}\Phi(x)}{\mathrm{d}A}[\frac W{m^2}][\frac{lm}{m^2}=\text{lux}]$$
要求单位平面与光线垂直；
#### 2.1.6 Radiance
Radiance 是对光线传播中的度量，是每单位立体角单位面积上的功率；
$$L(p,\omega)\equiv\frac{\mathrm{d^2}\Phi(p,\omega)}{\mathrm{d}\omega\mathrm{d}A\cos\theta}
[\frac {\text{W}}{\text{sr }\text{m}^2}][\frac {\text{cd}}{\text{m}^2}=\frac {\text{lm}}{\text{sr }\text{m}^2}=\text{nit}]$$
$\mathrm{d}A\cos\theta$ 为单位面积在传播方向上的有效面积

联系前面的两个量，有
$$
\begin{align}
L(p,\omega)=\frac{\mathrm{d}E(p)}{\mathrm{d}\omega\cos\theta}\\
L(p,\omega)=\frac{\mathrm{d}I(p,\omega)}{\mathrm{d}A\cos\theta}
\end{align}
$$

图形学上常用物理量为 Irradiance 和 Radiance ，Irradiance可以理解为单位面积吸收的总能量，Radiance 为单位面积从 $\mathrm{d}\omega$ 方向吸收的总能量，有
$$
\begin{align}
\mathrm{d}E(p,\omega)=L_i(p,\omega)\cos\theta\mathrm{d}\omega\\
E(p)=\int_{H^2}L_i(p,\omega)\cos\theta\mathrm{d}\omega
\end{align}
$$
![[Pasted image 20251105185218.png|400]]
### 2.2 双向反射分布函数(Bidirectional Reflectance Distribution, BRDF)
反射可以认为是从方向 $\omega_i$ 来的辐射转换为单位面积 $\mathrm{d}A$ 上的功率 $E$ ，这个功率会被反射到任意其他方向 $\omega_r$ ；
![[Pasted image 20251105190136.png|400]]
BRDF描述了各个其他方向 $\omega_r$ 分配到了多少能量；
$$f_r(\omega_i\to\omega_r)={\mathrm{d}L_r(\omega_r)\over\mathrm{d}E_i(\omega_i)}={\mathrm{d}L_r(\omega_r)\over L_i(\omega_i)\cos\theta_i\mathrm{d}\omega_i}[\frac 1{\text{sr}}]$$
那么某方向接收到的反射光即为
$$L_r(p,\omega_r)=\int_{H^2}f_r(p,\omega_i\to\omega_r)L_i(p,\omega_i)\cos\theta_i\mathrm{d}\omega_i$$
![[Pasted image 20251105190923.png|400]]
如果物体自发光，那么就有了渲染方程
$$L_o(p,\omega_o)=L_e(p,\omega_o)+\int_{\Omega^+}f_r(p,\omega_i,\omega_o)L_i(p,\omega_i)(n\cdot\omega_i)\mathrm{d}\omega_i$$
$L_e$ 部分为自发光，积分部分为反射光；$\omega_i$为指向光来向的向量；$p$ 可以认为是反射点表面的性质；

记 E 为自发光，K为反射操作符，L 可以记为 $L=E+KE+K^2E+...$ ，即为光源直射+一次反射+二次反射+……；
## 3 蒙特卡洛积分与路径追踪
### 3.1 蒙特卡洛积分(Monte Carlo Intergration)
计算难以解析求解的函数定积分的一种数值方法；
若求定积分 
$$\int_a^bf(x)\mathrm{d}x$$
定义随机变量 $X_i\sim p(x)$ ，有结果 
$$F_N=\frac 1N\sum_{i=1}^N\frac{f(X_i)}{p(X_i)}$$
​其中概率密度函数（probability density function ，PDF）要求 
$$\int_a^bp(x)\mathrm{d}x=1$$
如果随机变量均匀分布，则结果有 
$$F_N=\frac {b-a}N\sum_{i=1}^Nf(X_i)$$
此时即为黎曼积分；
$N$ 越大，结果越准确；
在 $p(x)$ 与 $f(x)$ 形状一致时，误差最小；

具体证明请看 [[蒙特卡洛积分(Monte Carlo Integration)|蒙特卡洛积分的理解]]
### 3.2 路径追踪(Path Tracing)
Whitted风格光线追踪总是进行镜面反射 / 折射，停止在漫反射表面，存在难以处理金属反射（glossy reflection）质感、无漫反射等问题；
对于渲染方程，我们需要递归地通过蒙特卡洛解半球上的积分；

我们的概率密度函数可以取 $p(\omega_i)=\frac 1 {2\pi}$ ，有
$$L_o(p,\omega_o)\approx L_e(p,\omega_o)+\frac {2\pi}N\sum_{i=1}^N{f_r(p,\omega_i,\omega_o)L_i(p,\omega_i)(n\cdot\omega_i)}$$
```cpp
shade (p,wo) //忽略自发光  
	Randomly choose N directions wi~PDF  
	Lo = 0.0  
	For each wi  
		Trace a ray r(p, wi)  
		If ray r hit the light  
			Lo += ( 2 * pi / N ) * L_i * f_r * cosine  
		Else If ray r hit an object at q  
			Lo += ( 2 * pi / N ) * shade(q, -wi) * f_r * cosine  
	Return Lo
```
上面的伪代码复杂度不可接受，$N$ 表示在每个点发射出的探测光线的个数。若使 $N=1$ 则有
```
shade (p,wo) //忽略自发光  
	Randomly choose 1 direction wi~PDF  
	Lo = 0.0  
	Trace a ray r(p, wi)  
	If ray r hit the light  
		Return ( 2 * pi ) * L_i * f_r * cosine  
	Else If ray r hit an object at q  
		Return ( 2 * pi ) * shade(q, -wi) * f_r * cosine
```
$N\ne 1$时即为分布式光线追踪（Distributed Ray Tracing），现很少使用；
对于降低 $N$ 造成的偏差，我们可以通过对于一个像素多次进行路径追踪并平均结果得到；
![[Pasted image 20251105193714.png|400]]
对于射线生成（Ray Generation），有伪代码
```cpp
ray_generation (camPos,pixel)  
	Uniformly choose N sample positions within the pixel  
	pixel_radiance = 0.0  
	For each sample in the pixel  
		shoot a ray r(camPos, cam_to_sample)  
		If ray r hit the scene at p  
			pixel_radiance += 1 / N * shade(p, sample_to_cam)  
	Return pixel_radiance
```
上述 shade 代码存在递归终止条件的问题.
我们选择轮盘赌策略（Russian Roulette，RR），在满足一定条件时停止递归；

如果有一个概率 $P$ ，我们有 $P$ 的概率发出光线，对于得到的 $L_o$ 取 $L_o/P$ ；有 $1-P$ 的概率不发出光线，得到的结果为 0 ；得到的结果期望依然为 $L_o$ ；

也可以通过控制 $P_{RR}$ 来控制期望弹射次数（递归深度）为 $\frac{1}{1-P_{RR}}$
此时即为路径追踪；
>[!note] 如何计算期望弹射次数
>这里提供一种求法
>设期望弹射次数为$N$,在第一次弹射有$P_{RR}$的概率弹射，有$1-P_{RR}$的概率不弹射。因此有：
>$$N=P_{RR}\cdot (N+1) +(1-P_{RR})\times1$$
>解的：
>$$N=\frac{1}{1-P_{RR}}$$

在低 SPP（samples per pixel）时，生成速度更快但会产生噪点；下面考虑加速；
如果光源很小，那么采样线打到光源的概率很低，浪费了很多的计算能力；
我们考虑对光源采样，将积分从 $\mathrm{d}\omega$ 变换为 $\mathrm{d}A$ ；
![[Pasted image 20251105195432.png|400]]
有关系
$$\mathrm{d}\omega =\frac{\mathrm{d}A\cos\theta'}{||x'-x||^2}$$
渲染方程换元有
$$L_o(p,\omega_o)=L_e(p,\omega_o)+\int_{A}f_r(p,\omega_i,\omega_o)L_i(p,\omega_i)\frac{\cos\theta\cos\theta'}{||x'-p||^2}\mathrm{d}A$$
考虑着色点的贡献来自于所有的光源和非光源，来自于光源的部分不需要 RR 策略来加速，来自于非光源的部分采用前述方法；

有伪代码
```
shade(p, wo)  
	# Contribution from the light source.  
	Uniformly sample the light at x' ( pdf_light = 1 / A)  
	Shoot a ray from p to x'  
	If the ray is not blocked in the middle  
	L_dir = L_i * f_r * cos theta * cos theta' / |x' - p|^2 / pdf_light  
	  
	# Contribution from other reflectors.  
	L_indir = 0.0  
	Test Russian Roulette with probability P_RR  
	Uniformly sample the hemisphere toward wi (pdf_hemi = 1 / 2pi)  
	Trace a ray r(p, wi)  
	If ray r hit a non-emitting object at q  
	L_indir = shade(q, -wi) * f_r * cos theta / pdf_hemi / P_RR  
	  
	return L_dir + L_indir
```
对于点光源的处理比较困难，课程内暂不赘述；

事实上计算出的 radiance 并不是颜色，需要进行伽马矫正（gamma correction）；
