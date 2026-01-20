[GAMES101（现代计算机图形学入门）笔记 - Yu_Tang](https://tanyuu.github.io/2024.01-07/GAMES101%E7%AC%94%E8%AE%B0/#lecture-07-shading-1-illumination-shading-and-graphics-pipeline%E7%9D%80%E8%89%B21-%E7%85%A7%E6%98%8E-%E5%B8%83%E6%9E%97-%E5%86%AF%E5%8F%8D%E5%B0%84%E6%A8%A1%E5%9E%8B%E5%92%8C%E9%98%B4%E5%BD%B1)
## 1 布林-冯反射模型 Blinn-Phong Reflectance model
将从一个点接受的光分为三部分：镜面反射（specular highlights）、漫反射（diffuse reflection）、环境光（ambient lighting）；环境光实际上是由环境和周边物体的反射混合形成的，在此模型中被简化为一个常量；
![[Pasted image 20251024135444.png]]
有如下输入量：相机方向单位向量$\hat v$ ，表面法向单位向量$\hat n$，对于每个光源的光源方向单位向量$\hat l$ ，表面参数$k$（与颜色、材质、反射方式等有关的反射率）；

模型是一种局部光照模型，指只考虑着色点、相机和光源之间的关系，不考虑着色点是否被其他物体遮挡；

对于漫反射项$L_d$、镜面反射项$L_s$、环境光项$L_a$，布林-冯模型有
$$L=L_d+L_s+L_a$$
### 1.1 漫反射项
漫反射指对于一条打向着色点的光线，其被均匀地反射到各个方向；
![[Pasted image 20251024135616.png]]
朗伯余弦定律（Lambert’s cosine law）：单位面积接受的辐射能量与法向和光向的夹角有关，夹角有$\cos\theta =\hat l\cdot \hat n$；
![[Pasted image 20251024135706.png]]
光衰减（平方反比定律）：与点光源距离为1的单位面积接受的能量为 I ，则距离为 r 的单位面积接受的能量为$I/r^2$；
综上有漫反射光公式
$$L_d=k_d(I/r^2)\max(0,\hat n\cdot \hat l)$$
$$
漫反射光强=漫反射系数\times \frac{原始光强}{光源距离^2}\times \cos (法光角)
$$
注意
$$
n\cdot \hat l
$$
中两个向量要转化为单位向量
### 1.2 高光项
![[Pasted image 20251024140053.png]]
$\hat v$和 R 足够接近时得到的高光；$\hat v$和 R 足够接近也就意味着$\hat h$（$\hat v$和$\hat l$的半程向量）和$\hat n$足够接近；
![[Pasted image 20251024140149.png]]
有
$$\hat h=\text{bisector}(v,l)\\
=\frac{\hat v+\hat l}{||\hat v+\hat l||}\\
$$
$$
L_s=k_s(I/r^2)\max(0,\cos\alpha)^p\\
=k_s(I/r^2)\max(0,\hat n\cdot \hat h)^p$$
$$
镜面反射光强=镜面反射系数\times \frac{原始光强}{光源距离^2}\times \cos (法半角)
$$
通常认为高光为白色，镜面反射系数取白色光反射系数；
朗伯余弦定律在镜面反射项中被简化；
如果通过 R 与 $\hat v$ 的夹角计算，会导致在计算 R 上耗费时间，所以实践中并不采用；
上式中的$p$为镜面指数，用于加快余弦项的衰减速度，通常在100~200之间；镜面指数越大，高光面积越小；
![[Pasted image 20251024141143.png]]
### 1.3 环境光项
$$L_a=k_aI_a$$
此模型中环境光与光向、法向、视向无关，视作一常数；
## 2 阴影映射(Shadow Mapping)
如果一个点不在阴影中，那么说明这个点对于相机和光源都是可见的；
阴影映射用于处理单个点光源的二值硬阴影（软阴影越靠近物体边界越浅，来自于光源非点产生的半影）；
在点光源处放置一个摄像机，对场景光栅化，存储每个可见点（与光源）的深度信息（Z-buffer）；
从相机出发再次光栅化，对于可见点将其投影回光源判断其深度与存储值是否一致，一致即说明该点无阴影，不一致即说明该点在阴影下；
阴影映射本身受制于点光源处光栅化的分辨率，生成的阴影会包含锯齿；
## 3 着色频率(Shading Frequencies)
着色频率是指空间上进行着色的密度，有以下几种主要方法：

1. 平面着色（flat shading）
    对于每个三角形进行着色计算，将结果应用于整个三角形上；
2. 顶点着色（gouraud shading）
    对于每个顶点进行着色计算，三角形内的着色由插值得出；
3. 像素着色（Phong shading）_与布林-冯模型的冯是同一个人，与着色模型无关_
    对于每个像素进行着色计算；
在面数较少时，像素着色频率越高效果越逼真，但在高面数情况下效果相近；
### 3.1 获得顶点/像素的法线
1. 如果已知模型的原始几何属性（e.g. 球、平面等），可以直接通过几何方法计算法线；
2. 一般情况，可以认为顶点法线是其相邻面法线的平均值  
![[Pasted image 20251024144102.png]]
$$N_v=\frac {\sum N_i}{||\sum N_i||}$$
3. 为了获取更准确的法线，可以按三角形面积等进行加权平均；
4. 像素的法线可以通过重心插值获取；
## 4 图形(实时渲染)管线(Graphics(Realtime Rendering)Pipeline)
实时渲染管线指从场景到图像的过程；
![[Pasted image 20251024144350.png]]
[Shadertoy BETA](https://www.shadertoy.com/)
## 5 纹理映射
三维物体的表面是二维的，表面可以与一张图形成映射关系；我们可以定义一张图，图上的每个三角形都映射到模型上的三角形，图上三角形的纹理就代表了模型上对应三角形的纹理；这张图就是uv贴图，得名于其两个坐标轴一般用 u 和 v 表示，无论其是方形或是矩形，通常认为范围有$u,v\in[0,1]$；

如果一块纹理在映射时，与上下左右的自己衔接不会产生缝隙，则被称为四方连续（tilable texture）；

我们假设已经掌握了这种映射关系，在已知三角形顶点坐标的情况下，获取三角形内部点的坐标需要通过重心坐标（Barycentric Coordinates）来完成；

### 5.1 重心坐标
重心坐标可以用于三角形内部的插值，在顶点处处理出的值（纹理映射、颜色、法向等）可以平滑地过渡到三角形内的任何一点；
![[Pasted image 20251024144953.png]]
在$\triangle ABC$所在平面内任何一点$(x,y)$，都可以表示成上图的形式；

由于和等于1的限制，实际上坐标由两个参数即可描述；

如果点在三角形内，则有$\alpha ,\beta, \gamma\geqslant0$ ；
对于平面内任意一点 P ，考虑$\triangle PAC,\triangle PCB, \triangle PBA$的有向面积（一一对应）$A_B, A_A, A_C$，有
$$
\begin{align}
\alpha_P=\frac {A_A}{A_A+A_B+A_C}\\
\beta_P=\frac {A_B}{A_A+A_B+A_C}\\
\gamma_P=\frac {A_C}{A_A+A_B+A_C}
\end{align}
$$
从坐标角度考虑，对于平面内任意一点$P(x,y)$，其重心坐标有
$$
\begin{align}
\alpha_P&=\frac{-(x-x_B)(y_C-y_B)+(y-y_B)(x_C-x_B)}{-(x_A-x_B)(y_C-y_B)+(y_A-y_B)(x_C-x_B)}\\
\beta_P&=\frac{-(x-x_C)(y_A-y_C)+(y-y_C)(x_A-x_C)}{-(x_B-x_C)(y_A-y_C)+(y_B-y_C)(x_A-x_C)}\\
\gamma_P&=1-\alpha_P-\beta_P
\end{align}
$$
$\triangle ABC$的重心有坐标$(\frac 13,\frac 13,\frac 13)$；
对于三角形内一点$P(\alpha,\beta,\gamma)$和三角形顶点上的属性$V_A,V_B,V_C$，有插值$V_P=\alpha V_A+\beta V_B+\gamma V_C$；

在投影变换下，不能够保证重心坐标不变；需要在三维空间进行插值，或对插值结果需要进行矫正；
[ 《GAMES101》作业框架问题详解](https://zhuanlan.zhihu.com/p/509902950)
$$
\begin{align}
\frac 1{z_0}=\alpha\frac 1{z_1}+\beta\frac 1{z_2}+\gamma\frac 1{z_3}\\
\frac {b_0}{z_0}=\alpha\frac {b_1}{z_1}+\beta\frac {b_2}{z_2}+\gamma\frac {b_3}{z_3}
\end{align}
$$
其中$b_0$即做透视校正插值后的正确顶点属性，$b_1,b_2,b_3$即该三角形三个顶点的顶点属性，$z_0$即做透视校正插值后的正确深度值，$[\alpha,\beta,\gamma]$即插值位置的重心坐标，$z_1,z_2,z_3$即该三角形三个顶点的深度值。
### 5.2 纹理应用
```
for each rasterized screen sample (x,y): // a pixel's center  
(u,v) = evaluate texture coordinate at (x,y); // by barycentric coordinates  
texcolor = texture.sample(u,v);  
set sample's color to texcolor; // about kd in Blinn-Phone
```
![[Pasted image 20251024145806.png]]
一个像素与一个纹理元素（texel）（纹理像素）的大小关系并不固定，需要进行“纹理缩放”；

#### 5.2.1 纹理放大
如果纹理分辨率低于渲染所需的分辨率，就会产生不符合预期的效果；

对于计算出来的浮点 (u,v)(u,v) ，我们需要选择一种合适的策略将其映射到纹素上；
##### 5.2.1.1 双线性插值（Bilinear）
![[Pasted image 20251024145933.png]]
红点为计算出的$(u,v)$，将其距离左下最近纹素的水平距离标记为 s ，竖直距离标记为 t ；

定义一个运算：线性插值（linear interpolation），对于 $x\in[0,1]$ 和两个值 $v_1,v_0$ ，有
$$\text{lerp}(x,v_0,v_1)=v_0+x(v_1-v_0)$$
对双线性插值，定义有
$$
\begin{align}
u_0=\text{lerp}(s,u_{00},u_{10})\\
u_1=\text{lerp}(s,u_{01},u_{11})\\
u_{uv}=\text{lerp}(t,u_{0},u_{1})
\end{align}
$$
双立方插值（Bicubic）区别在于考虑邻近的16个纹素进行立方插值；
#### 5.2.2 纹理缩小
如果一个纹素的大小远小于一个像素的大小，即采样频率远小于纹理的频率，那么便会产生走样现象，可以通过反走样方法（取平均）进行处理，但是比较耗费资源；于是，我们考虑提前把平均结果计算并存储起来。下面的技术就是为了解决这一问题。

##### Mipmap
我们将像素范围内的纹素近似平均值作为返回值；
Mipmap是一种一种快速的、近似的、正方形的范围查询；
我们需要存储纹理图的低分辨率版本（每级边长折半，多花费1/3的空间）
![[Pasted image 20251024191742.png]]
接下来计算单个像素的覆盖面积：考虑一个采样点和其水平、垂直方向的两个相邻采样点，这三个点映射在纹理图上的坐标；
![[Pasted image 20251024191830.png]]
$$L=\max(\sqrt{(\frac {du}{dx})^2+(\frac {dv}{dx})^2},\sqrt{(\frac {du}{dy})^2+(\frac {dv}{dy})^2})$$
$L$可以近似看作像素所在纹理上正方形的边长；
![[Pasted image 20251024191913.png]]
利用公式
$$D=\log_2L$$
计算出我们对这个采样点进行着色时应该使用的Mipmap等级$D$.如果$D$是整数，这意味着当前采样点对应区域在 Level D 的 Mipmap 上为一个像素。我们可以直接拿这个像素进行着色。
对于非整数的D，我们要进行下一步处理
**三线性插值**
对于非整数的 D ，我们可以对 Mipmap 进行层间插值，这个过程被称为三线性插值（水平，垂直，层间）；其中的“三”意味着比“双线性插值”多出了“层间”这一维度。
![[Pasted image 20251024192641.png]]

Mipmap 会产生 Overblur （过度模糊）现象，比如下图中相比于近处，远处的纹理会更加模糊。这是因为前面我们把采样点映射到纹理上的正方形，但是实际上（如下图所示）平面中远处的位置在屏幕上显示时，采样点映射到纹理空间会是明显的长方形。而按我们之前进行三线性插值的做法，我们会根据把它按长边当作一个大正方形。这会导致采样了一大片纹理像素，使其变得模糊。
![[Pasted image 20251024193211.png]]
##### 各向异性过滤（Anisotropic Filtering，Ripmap）
各向异性指在各个方向上其表现不同，在这里特指两个轴向方向上的表现不同；
各向异性过滤可以解决上图中的轴向矩形区域，对于斜向区域仍然存在问题；
![[Pasted image 20251024194135.png]]
不同于 Mipmap 只存储了上图中对角线上的图片，各向异性过滤通过存储不同长宽比的原始图像来实现轴向矩形区域的查询（多花费3倍的空间）。
各向异性过滤的层数选项：对于4x各向异性过滤指取上图左上 3×3 的图片区域进行计算，标记的是横纵压缩倍数；高倍数的各向异性过滤对计算能力消耗很小，但对显存消耗较大；

##### EWA filtering
更进一步可以使用 EWA 过滤（EWA filtering）来实现真正意义上的各向同性
[EWA滤波 - 知乎](https://zhuanlan.zhihu.com/p/105167411)
#### 5.2.3 环境贴图（环境光照）
在现代 GPU 中，纹理可以抽象地被表述成可以快速进行范围查询的一块数据；
如果我们通过纹理来描述环境光情况，再用这个纹理对物体进行渲染，便可以实现环境光照的效果；通过此种方法进行模拟，需要假设环境光来自无限远；
假设有一个镜子的球，将球面上反射的环境光记录为环境光信息，这就是球环境贴图（Spherical Environment Map）；
![[Pasted image 20251024195829.png]]
接下来对球面进行展开存储，在类似于世界地图的投影方式中，两极部分会被扭曲变形；考虑使用立方体贴图（Cube Map）进行存储：
![[Pasted image 20251024195846.png]]
在球外添加一个正方体包围盒，从球心发出的射线打到包围盒上的位置即为该方向上的球面映射到立方体贴图上的位置；
#### 5.2.4 位移贴图(置换贴图)Displacement Mapping
纹理不止可以描述颜色，如果通过纹理记录表面相对高度，便可以在不增加面数的情况下来定义更精细的（假）模型；
想要用纹理来给模型增加细节，最容易想到的就是用纹理表示模型表面的高度。而这种纹理被称为**位移贴图**
位移贴图是对顶点位置的移动；观察下图中的边缘和阴影
![[Pasted image 20251025081919.png]]
其代价为要求模型本身面数足够；为了解决这个问题 DirectX 使用动态曲面细分降低消耗；
#### 5.2.5 法线贴图(Normal Mapping)
除了置换贴图，另一种解决方案时法线贴图。置换贴图是对顶点位置的移动，而法线贴图并不移动顶点位置，只是对法线进行修改。
![[Pasted image 20251024200054.png]]
##### 用NormalMap存储BumpMap
[凹凸贴图、法线贴图、切线空间、TBN矩阵讲解 - 知乎](https://zhuanlan.zhihu.com/p/412555049)
BumpMap翻译为凹凸贴图，也叫高度场纹理，高度场纹理是编码每个Texel(纹素)的高度（高度贴图越亮，代表的高度越高）。
![[Pasted image 20251025082613.jpg]]

![[Pasted image 20251025092252.png]]
$H_g$是高度贴图给定Texel(纹素)的高度（可以理解为颜色，高度值越大，颜色越亮）
$H_a$是给定Texel(纹素)正上方Texel的高度
$H_r$是给定Texel(纹素)正右方Texel的高度

$$
\begin{align}
\hat{n}&=(1,0,H_r-H_g)\times(0,1,H_a-H_g) \\
&=(H_g-H_r,H_g-H_a,1)
\end{align}
$$

归一化后
$$normal =\dfrac{\langle H_g-H_r,H_g-H_a,1\rangle}{\sqrt{(H_g-H_a)^2+(H_g-H_r)^2+1)}} $$
这里的法线方向是**切向空间的法线方向**（有些地方也说成是纹理空间，你也可以理解为uv空间，因为Tex图是通过uv坐标映射到模型表面上的）

法线的z值基本上都为正（其实可以为负，但是几乎不会有人这么做），所以为什么我们看到的法线贴图**蓝色居多**

蓝色表示法线贴图基本没有改变模型的法线信息，而那些非蓝色的地方才是替换后法线改变最严重的地方，具体原因还请往下看

因为归一化的法线向量$Normal$是有符号值，范围是$[-1,1]$； 而贴图中RGB是无符号值，范围是$[0,1]$，因此就需要**范围压缩**：
$Col = 0.5 * Normal+0.5$
所以不能直接使用法线贴图，使用前要**解码**
$Normal = 2*(Col-0.5)$
可以想到当Normal为(0,0,1)时，编码后的颜色是(0.5,0.5,1),这就是法线最亮的蓝色, (0.5,0.5,1)也是"bump"的值

##### UV空间
UV空间是二维的，切向空间是三维的，有人说把UV映射到三维物体表面，算上顶点的法线，就构成了切向空间，U是切线方向，V是副切线方向，**其实这种说法是不对的**。
因为映射之后，在三维空间中U和V并不垂直。
模型上的每个点的空间坐标$(x,y,z)$和uv坐标$(u,v)$是一一对应的，即$x,y,z$都是 $u$ 和 $v$ 的函数
三维空间中u向量的方向可以用 $x,y,z$ 关于$u$ **的梯度值**表示
$$T=\bigg\langle\dfrac{\partial x}{\partial u},\dfrac{\partial y}{\partial u},\dfrac{\partial z}{\partial u}\bigg\rangle $$
##### 切向空间
切向空间是由切线$\mathbf{t}_{\bot}$、副切线$\mathbf{b}_{\bot}$、顶点法线$\mathbf{\stackrel{\land}{n}_点}$以模型顶点为中心的坐标空间
上边为我们已经知道了正交前切线方向$\mathbf{t}$，我们就利用其和$\mathbf{\stackrel{\land}{n}_点}$来构造正交后的$\mathbf{t}_{\bot}$和$\mathbf{b}_{\bot}$
其公式如下：
$\mathbf{t}_{\bot}=normalize(\mathbf{t}-(\mathbf{t}\cdot \mathbf{\stackrel{\land}{n}_点})\mathbf{\stackrel{\land}{n}_点})$
$\mathbf{b}_{\bot}=normalize(\mathbf{t}_\bot \times\mathbf{\stackrel{\land}{n}_点})$
其中，$\mathbf{t}$ 是正交前的切线方向，也可以说是u方向

切线空间的三个坐标轴就是$(\mathbf{t}_{\bot},\mathbf{b}_{\bot},\mathbf{\stackrel{\land}{n}_点})$
可以发现正交化后的$\mathbf{t}_{\bot}$和$\mathbf{b}_{\bot}$不一定和原来的uv方向一一对应
$\mathbf{t}_{\bot}$和$\mathbf{b}_{\bot}$都和$\mathbf{\stackrel{\land}{n}_点}$有关，正常情况下$\mathbf{t}_{\bot}$和$\mathbf{b}_{\bot}$都在面上，但当我们强行改变$\mathbf{\stackrel{\land}{n}_点}$的时候，使它不满足面法线的平均，就可能出现$\mathbf{t}_{\bot}$和$\mathbf{b}_{\bot}$都不在面上
正交后的切线和副切线才能算作是切向空间的坐标轴
##### TBN矩阵
**TBN矩阵**指的是：由Tangent切线、Bitangent副切线（有些地方也叫副法线）、Normal法线，组成的3x3的矩阵（**这里的切线和副切线都是正交后的）**
注：这里的切线、副切线、法线全部指的是**世界空间的向量，** 不是切线空间下的

世界空间，将世界中心当作世界空间坐标的原点，那么下图中模型的每一个点的TBN方向和光照方向一样，都是世界空间下的方向$(x,y,z)$

切向空间，将每个顶点当作坐标原点，下图T方向其实就是uv坐标的u方向,如果不好理解的话，建议脱离下图，用坐标$(u,v,n)$表示

![[Pasted image 20251025101902.jpg]]

法线贴图里面是切向空间的法线信息，而我们实际需要的是世界空间的法线信息。
为此我们需要一个桥梁来将切向空间的**法线信息**转化会**世界空间**的法线信息，这个桥梁就是TBN矩阵。

$$
\hat{n}_{w}=
\begin{bmatrix}
T&B&N
\end{bmatrix}
\hat{n}_{t}
=\begin{bmatrix}
T_x&B_x&N_x \\
T_y&B_y&N_y \\
T_z&B_z&N_z \\
\end{bmatrix}
\hat{n}_{t}
$$

其中$\hat{n}_{w}$表示世界(world)空间中的法线(normal)向量，
$\hat{n}_{t}$表示切向(tangent)空间中的法线(normal)向量。
为什么是这样呢，我们可以举个例子

$$
当
\hat{n}_{t}=
\begin{bmatrix}
0 \\
0 \\
1\\
\end{bmatrix}
时，则
\hat{n}_{w}=
\begin{bmatrix}
T&B&N
\end{bmatrix}
\begin{bmatrix}
0 \\ 0 \\ 1\\
\end{bmatrix}
=N
$$

可以看到TBN矩阵能够把切向空间的原始法线转化为世界空间中原始的法线向量。
法线贴图的切向空间法线信息我们已经在上边通过凹凸贴图求过了：
$$normal =\dfrac{\langle H_g-H_r,H_g-H_a,1\rangle}{\sqrt{(H_g-H_a)^2+(H_g-H_r)^2+1)}}$$
再来解释为什么法线贴图蓝色的地方对模型的法线改变不大，我们假设法线贴图纯蓝即$\hat{n}_{t}=(0,0,1)^T$,那么将其代入上面的转换公式，可以得到$\hat{n}_{w}=N$,和原模型的法线一样，没变化
在切向空间，法线为红或者绿色的地方，对应世界空间下，模型的法线扰动最大
##### 总结
假设有凹凸贴图 $p=h(u,v)$，在一点 $(u,v)$ 处，原始法线为 $(0,0,1)$ ，经过法线贴图修饰后法线有
$$
\begin{align}
\frac {dp}{du}=c_1[h(u+1,v)-h(u,v)]\\
\frac {dp}{dv}=c_2[h(u,v+1)-h(u,v)]\\
\hat n=(-\frac {dp}{du},-\frac {dp}{dv},1).\text{normalized()}
\end{align}
$$
c1，c2为在u，v两个方向上的影响系数，代表纹理定义的法线对于展示物体法线的影响系数；

由于原始法线 $(0,0,1)$ 假设，实际上计算出的法线是局部坐标系（切线空间）下的，需要再通过TBN矩阵变换回原坐标系；
TBN矩阵指的是由切线（Tangent）、副切线（Bitangent）（有些地方也叫副法线）、法线（Normal），组成的3x3的矩阵（这里的切线、副切线、法线全部指的是世界空间的向量，不是切线空间下的，TBN三向量正交且归一）；

参考作业代码，有

$$
\begin{align}
T&=
\begin{bmatrix}
\frac{N_xN_y}{\sqrt{N_x^2+N_z^2}}\\
-\sqrt{N_x^2+N_z^2}\\
\frac{N_yN_z}{\sqrt{N_x^2+N_z^2}}
\end{bmatrix}
=\frac{1}{\sqrt{N_x^2+N_z^2}}
\begin{bmatrix}
{N_xN_y}\\
-(N_x^2+N_z^2)\\
{N_yN_z}
\end{bmatrix}
\\
B&=N\times T
\end{align}
$$

变换过程有

$$n_{World}=
\begin{bmatrix}
 T_x & B_x & N_x\\
 T_y & B_y & N_y\\
 T_z & B_z & N_z
\end{bmatrix}
n_{TBN}$$

**为什么这样算**

$$
\begin{align*}
T &= 
(N_x,N_y,N_z)^T\\
&\times (-N_z,0,N_x)^T \\
&=(N_xN_y,\ -(N_x^2+N_z^2),\ N_yN_z )^T
\end{align*}
$$
可以看到$T$其实就是这法线向量$N$和$(N_x,N_y,N_z)$叉乘再进行归一化的产物,因此$T$与$N$是垂直的关系

