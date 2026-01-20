[GAMES101（现代计算机图形学入门）笔记 - Yu_Tang](https://tanyuu.github.io/2024.01-07/GAMES101%E7%AC%94%E8%AE%B0/)
## 1 2D Transformation
### 1.1 Affine Transformation(仿射变换)
$$ 
\begin{bmatrix} x' \\ y' \end{bmatrix} = \begin{bmatrix} a & b \\ c & d \end{bmatrix} \begin{bmatrix} x \\ y \end{bmatrix} + \begin{bmatrix} e \\ f \end{bmatrix} 
$$

仿射变换并不能像其他变换一样用单纯的用矩阵乘法进行表示。为了方便表示，我们引入了齐次坐标

$$
\begin{bmatrix}
x\\y\\ \omega
\end{bmatrix}
$$

若$\omega$为0，则说明其表示的是向量，否则则为点。
若齐次坐标表示点时

$$
\begin{bmatrix}
x\\y\\ \omega
\end{bmatrix}
等价于
\begin{bmatrix}
\frac{x}{\omega}\\\frac{y}{\omega} \\1
\end{bmatrix}
表示点(\frac{x}{\omega},\frac{y}{\omega})
$$

齐次坐标表示下，平移变换即可用矩阵乘法表示为：

$$
\begin{bmatrix} x' \\ y' \\ \omega' \end{bmatrix} = \begin{bmatrix} 1 & 0 & t_x \\ 0 & 1 & t_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ \omega \end{bmatrix} = \begin{bmatrix} x + \omega t_x \\ y + \omega t_y \\ \omega \end{bmatrix}
$$
#### 缩放变换（Scale Transformation)与反射变换(Reflection Tranformation)
横轴缩放$S_x$倍，纵轴缩放$S_y$倍的缩放变换 $S(s_x,s_y)$ 表示为：

$$
\begin{bmatrix} x' \\ y' \\ \omega' \end{bmatrix} = \begin{bmatrix} s_x & 0 & 0 \\ 0 & s_y & 0 \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x \\ y \\ \omega \end{bmatrix} = \begin{bmatrix} x s_x \\ y s_y \\ \omega \end{bmatrix}
$$

若 $s_∗<0$ 则认为是反射变换；
#### 切变变换(Shear Transformation)
切变变换的核心是图形沿某一坐标轴方向移动，移动距离与该点到另一坐标轴的距离成正比，且平行于该坐标轴的线段长度不变。
例如沿x轴方向切变需要保证y坐标不变，变换效果就是 x 坐标随 y 坐标线性变化，y 坐标保持不变。
设坐标变换前原向量为$(x,y)$, 变换后向量$(x',y')$满足

$$
\begin{cases}
x' = x + ky\quad \\
 y' = y
\end{cases}
$$

将上述切变拓展到xy两个轴上同时进行，得到下列公式
![[Pasted image 20251021102432.png|300]]
符合$x'=x+a_xy,y'=y+a_yx$的切变变换表示为：
$$\begin{bmatrix} x'\\y'\\\omega' \end{bmatrix} = \begin{bmatrix} 1&a_x&0\\ a_y&1&0\\ 0&0&1 \end{bmatrix} \begin{bmatrix} x\\y\\\omega \end{bmatrix}=\begin{bmatrix} x+a_xy\\y+a_yx\\\omega \end{bmatrix}
$$
#### 1.1.1 旋转变换(Rotate Transformation)

旋转变换默认绕$(0,0)$进行，以$x^+$为起始，逆时针为正
![[Pasted image 20251021102847.png|300]]
旋转$\theta$的旋转变换$R_\theta$表示为：

$$\begin{bmatrix}
x'\\y'\\\omega'
\end{bmatrix}=
\begin{bmatrix}
\cos\theta&-\sin\theta&0\\
\sin\theta&\cos\theta&0\\
0&0&1
\end{bmatrix}
\begin{bmatrix}
x\\y\\\omega
\end{bmatrix}$$

怎么记忆这个公式呢
可以通过欧拉公式来记忆

$$e^{ix}=\cos(x)+i\sin(x)$$

$$
\begin{align}
e^{i\theta}\cdot (x+iy)&=
(\cos\theta+i\sin\theta)\cdot(x+iy) \\
&=x\cos\theta-y\sin\theta + i(x\sin\theta +y\cos\theta) 
\end{align}
$$

### 1.2 逆变换
若$A'=MA$，即$A$可由$A'$进行变换得到 $A=M^{-1}A'$
### 1.3 变换顺序
若先进行$R{(45\degree)}$，再进行$T{(1,0)}$，则过程表示为：

$$
A\xrightarrow{R{(45\degree)}}R{(45\degree)}A\xrightarrow{T{(1,0)}}T{(1,0)}R{(45\degree)}A
$$

由于矩阵乘法具有结合律，可以先计算$T{(1,0)}R{(45\degree)}$ ，再右乘上$A$；
## 2 三维模型变换
### 2.1 平移变换

$$T{(t_x,t_y,t_z)}=
\begin{bmatrix}
1&0&0&t_x\\
0&1&0&t_y\\
0&0&1&t_z\\
0&0&0&1
\end{bmatrix}$$

### 2.2 缩放变换与反射变换
$$
S{(s_x,s_y,s_z)}=
\begin{bmatrix}
s_x&0&0&0\\
0&s_y&0&0\\
0&0&s_z&0\\
0&0&0&1
\end{bmatrix}
$$
### 2.3 旋转变换
#### 2.3.1 绕坐标轴旋转
$$
R_x(\alpha)=
\begin{bmatrix}
1&0&0&0\\
0&\cos\alpha&-\sin\alpha&0\\
0&\sin\alpha&\cos\alpha&0\\
0&0&0&1
\end{bmatrix}\\
$$
$$
R_y(\alpha)=
\begin{bmatrix}
\cos\alpha&0&\sin\alpha&0\\
0&1&0&0\\
-\sin\alpha&0&\cos\alpha&0\\
0&0&0&1
\end{bmatrix}\\
$$
$$
R_z(\alpha)=
\begin{bmatrix}
\cos\alpha&-\sin\alpha&0&0\\
\sin\alpha&\cos\alpha&0&0\\
0&0&1&0\\
0&0&0&1
\end{bmatrix}\\
$$
#### 2.3.2 欧拉角旋转公式
将任意旋转分解为$x,y,z$轴上的旋转，分别进行变换
$$R_{xyz}(\alpha,\beta,\gamma)=R_x(\alpha)R_y(\beta)R_z(\gamma)$$
## 3 视角变换
### 3.1 视图变换（相机变换）（View / Camera Transformation）
相机有一下几个方位属性
- 位置（Position）$\vec e$
- 视线方向 $\hat g$
- 向上方向 $\hat t$
我们将原坐标系变换为相机坐标系，并符合如下规则：
- 相机在原点
- 向上方向为 $y^+$
- 视线方向为 $z^-$
![[Pasted image 20251021150645.png]]
假设变换矩阵为$M_{view}$ ，考虑其的形式（$M_{view}=R_{view}T_{view}$）:
- 首先将相机点移到原点($T_{view}=T_{(-\vec e)}$)
- 再进行坐标轴旋转$R_{view}$
平移变换比较简单:
$$
T_{view}=
\begin{bmatrix}
1&0&0&-x_e\\
0&1&0&-y_e\\
0&0&1&-z_e\\
0&0&0&1
\end{bmatrix}\\
$$
要想求旋转变换$R_{view}$，需要先考虑$R_{view}^{-1}$，即相机坐标系变换回原坐标系
$$R_{view}^{-1}=
\begin{bmatrix}
x_{\hat g\times\hat t}&x_{\hat t}&x_{-\hat g}&0\\
y_{\hat g\times\hat t}&y_{\hat t}&y_{-\hat g}&0\\
z_{\hat g\times\hat t}&z_{\hat t}&z_{-\hat g}&0\\
0&0&0&1
\end{bmatrix}$$
为什么是这样呢？稍微计算一下就知道了，它可以把初始的x，y，z轴旋转到摄像机的对应轴上,例如：
$$R_{view}^{-1}\vec{x}=
\begin{bmatrix}
x_{\hat g\times\hat t}&x_{\hat t}&x_{-\hat g}&0\\
y_{\hat g\times\hat t}&y_{\hat t}&y_{-\hat g}&0\\
z_{\hat g\times\hat t}&z_{\hat t}&z_{-\hat g}&0\\
0&0&0&1
\end{bmatrix}
\cdot 
\begin{bmatrix}
1\\
0\\
0\\
1
\end{bmatrix}
=
\begin{bmatrix}
\hat g\times\hat t \\
1
\end{bmatrix}
$$
旋转变换$R_{view}$是正交矩阵，因此它的逆矩阵就是它的转置
$$R_{view}=
\begin{bmatrix}
x_{\hat g\times\hat t}&y_{\hat g\times\hat t}&z_{\hat g\times\hat t}&0\\
x_{\hat t}&y_{\hat t}&z_{\hat t}&0\\
x_{-\hat g}&y_{-\hat g}&z_{-\hat g}&0\\
0&0&0&1
\end{bmatrix}$$
把两个变换合成一下，就得到了视图变换/相机变换矩阵
$$
M_{view}=R_{view}T_{view}
=
\begin{bmatrix}
x_{\hat g\times\hat t}&y_{\hat g\times\hat t}&z_{\hat g\times\hat t}&0\\
x_{\hat t}&y_{\hat t}&z_{\hat t}&0\\
x_{-\hat g}&y_{-\hat g}&z_{-\hat g}&0\\
0&0&0&1
\end{bmatrix}
\cdot 
\begin{bmatrix}
1&0&0&-x_e\\
0&1&0&-y_e\\
0&0&1&-z_e\\
0&0&0&1
\end{bmatrix}\\
$$

### 3.2 投影变换(projection transformation)
#### 3.2.1 正交投影(Orthographic Projection)
[视图变换和投影变换矩阵的原理及推导- 知乎](https://zhuanlan.zhihu.com/p/362713511)
进行相机变换之后,我们可以进行正交投影
我们的做法是：将z坐标写为0, $x,y$坐标的$(-\infty,+\infty)^2$映射到$[-1,1]^2$
具体步骤如下
![[Pasted image 20251021155913.png]]
首先看相机变换后空间，我们定义其中存在视景体如上图所示。
视景体（即图中的长方体）有一下几个属性

- 具有在$x$轴上的左右$[l,r]$，即left和right
- 在$y$轴上的上下$[b,t]$，即bottom和top
- 在$z$轴上的远近 $[f,n]$，即far和near

接下来我们要将视景体变换成一个**标准立方体**（**canonical cube**）。
何为标准立方体？即以原点为中心，边长为2的立方体，也就是立方形在x，y，z三个轴上都是从-1到1。这个变换过程就是我们的**正交投影变换**，它具体分为两步
1. 平移变换，将长方体S平移到原点。
2. 缩放变换，将长方体S的长宽高缩放到2

首先是移到原点的平移变换，即把长方体S的中心点移动到原点
$$
\mathbf{M}=\begin{bmatrix} 1 &0 &0 & -\frac{r+l}{2}\\ 0 &1 &0 & -\frac{t+b}{2}\\ 0 &0 &1 & -\frac{n+f}{2}\\ 0 &0 &0 &1 \end{bmatrix}
$$
之后是缩放变换
$$\mathbf{S}=\begin{bmatrix} \frac{2}{r-l} & 0 &0 &0 \\ 0& \frac{2}{t-b} &0 &0 \\ 0& 0 & \frac{2}{n-f} &0 \\ 0&0 & 0 & 1 \end{bmatrix}$$
最终的正交投影变换矩阵为
$$\mathbf{P}_{ortho}=\mathbf{S}\mathbf{M}=\begin{bmatrix} \frac{2}{r-l} & 0 &0 &0 \\ 0& \frac{2}{t-b} &0 &0 \\ 0& 0 & \frac{2}{n-f} &0 \\ 0&0 & 0 & 1 \end{bmatrix} \begin{bmatrix} 1 &0 &0 & -\frac{r+l}{2}\\ 0 &1 &0 & -\frac{t+b}{2}\\ 0 &0 &1 & -\frac{n+f}{2}\\ 0 &0 &0 &1 \end{bmatrix}= \begin{bmatrix} \frac{2}{r-l} &0 &0 & -\frac{r+l}{r-l}\\ 0 &\frac{2}{t-b} &0 & -\frac{t+b}{t-b}\\ 0 &0 &\frac{2}{n-f} & -\frac{n+f}{n-f}\\ 0 &0 &0 &1 \end{bmatrix}$$
注：该变化会导致物体的被拉伸（因为长方体变成了立方体），在后续的**视口变换**过程中会再对此进行处理。

#### 3.2.2 透视投影(Perspective Projection)
![[Pasted image 20251021161509.jpg]]
投影变换是把相机观测的空间压缩成一个标准立方体。在透视投影中，我们摄像机所观测的区域不再是一个长方体，而是变成了一个四棱台（即四棱锥去掉顶部），也就是我们常说的**视锥体**（Frustum）。
对于这个视锥体我们应该如何把它压缩成标准立方体呢？思路是这样的
1. 我们先通过某种变换把这个视锥体压缩成一个长方体
2. 再把长方体移到原点上压缩成标准立方体，即等于执行正交投影变换

那么我们只需要计算出第一步的变换矩阵（设为$\mathbf{T}$），然后将它乘以正交投影变换矩阵，即可得到我们的透视投影变换矩阵（设为$\mathbf{P}_{persp}$）了。

要使视锥体变为长方体
首先我们要使$T_1T_2$变为$y=|T_1N|$的直线,$B_1B_2$变为$y=-|B_1N|$的直线，$L_1L_2$变为$x=-|L_1N|$的直线，$R_1R_2$变为$x=|R_1N|$的直线。

首先我们来看看如何使$T_1T_2$变为$y=|T_1N|$的直线，我们可以从x轴方向看向yz平面，来观察这个视锥体
![[Pasted image 20251021164029.jpg]]
对于点$T_2$(它的z坐标值为$f$)利用相似三角形，$|T_2F|\cdot \frac{n}{f} = |T_1N|$
在$T_1T_2$直线上的任意一点，设(x,y,z)，其y值只需乘以$\frac{n}{z}$即可与$T_1$点的y值相等
进一步拓展：对应视锥体里的任意一点 (x,y,z)，我们只需要将其x和y的值乘以$\frac{n}{z}$即可使该视锥体变为长方体。

$$\begin{bmatrix} \frac{n}{z} & 0 & 0\\ 0 & \frac{n}{z} & 0\\ ? & ? & ? \end{bmatrix}\begin{bmatrix} x\\ y\\ z \end{bmatrix}=\begin{bmatrix} x\frac{n}{z}\\ y\frac{n}{z}\\ ? \end{bmatrix}$$
**矩阵中的z是一个变量，导致该矩阵并不是一个常量**
根据之前提到的齐次坐标的概念,我们可以把上面的矩阵修改为下面这样。
$$\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ ? & ? & ? & ? \\0&0&1&0\end{bmatrix}\begin{bmatrix} x\\ y\\ z\\1\end{bmatrix}=\begin{bmatrix} xn\\ yn\\ ? \\z \end{bmatrix}$$
这样相当于是利用多出来的维度可以读取点的z轴坐标，并结合齐次坐标的性质实现除以z的操作
接下来我们要看看z值的变换，从图中我们可得知的信息为变为长方体后：
1.Near clip plane上的任意点，设为(i,j,n)，它的z值不变依旧为 n。  
2.Far clip plane上的任意点，设为(k,l,f)，它的z值不变依旧为 f。
$$\left\{\begin{matrix} \begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ ? & ? & ? & ? \\0&0&1&0\end{bmatrix}\begin{bmatrix} i\\ j\\ n\\1\end{bmatrix}=\begin{bmatrix} in\\ jn\\ n^2 \\n \end{bmatrix}\\ \\ \\ \begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ ? & ? & ? & ? \\0&0&1&0\end{bmatrix}\begin{bmatrix} k\\ l\\ f\\1\end{bmatrix}=\begin{bmatrix} kf\\ lf\\ f^2 \\f \end{bmatrix} \end{matrix}\right.$$
设我们矩阵中的四个未知数分别为A，B，C，D，
$$\left\{\begin{matrix} Ai+Bj+Cn+D=n^2\\ Ak+Bl+Cf+D=f^2 \end{matrix}\right.$$
$$\left\{\begin{matrix} Cn+D=n^2\\ Cf+D=f^2 \end{matrix}\right.$$
即可算出，C=n+f，D=-nf，因此视锥体压缩为长方体的矩阵为：
$$
\mathbf{T}=\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ 0 & 0 & n+f & -nf \\0&0&1&0\end{bmatrix}
$$
>[!important] 变换的副作用 
>在该变换过程中，任意点的z的值可能是会发生变化的
>视锥体的中心点$(0,0,\frac{n+f}{2})$变换后为例
>
>$$\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ 0 & 0 & n+f & -nf \\0&0&1&0\end{bmatrix}\begin{bmatrix} 0\\ 0\\ \frac{n+f}{2}\\ 1 \end{bmatrix} = \begin{bmatrix} 0\\ 0\\ \frac{(n+f)^2}{2}-nf\\ \frac{n+f}{2} \end{bmatrix}\Leftrightarrow \begin{bmatrix} 0\\ 0\\ \frac{n^2+f^2}{n+f}\\ 1 \end{bmatrix}$$
>
>比较一下大小
>$\frac{n+f}{2}-\frac{n^2+f^2}{n+f}=\frac{n^2+f^2+2nf-2n^2-2f^2}{2(n+f)}=\frac{-(n-f)^2}{2(n+f)}>0（其中n和f都小于0）$
>
>即**视锥体的中心点在变换后离摄像机更远了**。
>
>

由上述计算可知，透视变换中z值的变换不是线性的，这会导致后续我们进行插值运算（用屏幕坐标插值求三维坐标）时很不方便。既然z值的变换不是线性的，那透视变换中有没有什么关于z的属性是线性变换的呢？


变成长方体后，只需在执行一次正交投影变换即可，因此我们的透视投影变换矩阵为：

$\mathbf{P}_{persp}=\mathbf{P}_{ortho}\mathbf{T}=\begin{bmatrix} \frac{2}{r-l} &0 &0 & -\frac{r+l}{r-l}\\ 0 &\frac{2}{t-b} &0 & -\frac{t+b}{t-b}\\ 0 &0 &\frac{2}{n-f} & -\frac{n+f}{n-f}\\ 0 &0 &0 &1 \end{bmatrix}\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ 0 & 0 & n+f & -nf \\0&0&1&0\end{bmatrix} = \begin{bmatrix} \frac{2n}{r-l} &0 & -\frac{r+l}{r-l} & 0 \\ 0 &\frac{2n}{t-b} & -\frac{t+b}{t-b} &0 \\ 0 &0 &\frac{n+f}{n-f} & \frac{-2nf}{n-f} \\ 0 &0 &1 &0 \end{bmatrix}$
#### 3.2.3 对称视锥体
对称视锥体，即为N为Near clip plane的中心点，F为Far clip plane的中心点，因此我们可得：
$$\left\{\begin{matrix} r=-l\\ t=-b \end{matrix}\right.$$
那么正交投影矩阵就可以简化为：

$\mathbf{P}_{ortho}=\mathbf{S}\mathbf{M}=\begin{bmatrix} \frac{2}{r-l} & 0 &0 &0 \\ 0& \frac{2}{t-b} &0 &0 \\ 0& 0 & \frac{2}{n-f} &0 \\ 0&0 & 0 & 1 \end{bmatrix} \begin{bmatrix} 1 &0 &0 & 0\\ 0 &1 &0 & 0\\ 0 &0 &1 & -\frac{n+f}{2}\\ 0 &0 &0 &1 \end{bmatrix}= \begin{bmatrix} \frac{2}{r-l} &0 &0 & 0\\ 0 &\frac{2}{t-b} &0 & 0\\ 0 &0 &\frac{2}{n-f} & -\frac{n+f}{n-f}\\ 0 &0 &0 &1 \end{bmatrix}$

$\mathbf{P}_{persp}=\mathbf{P}_{ortho}\mathbf{T}=\begin{bmatrix} \frac{2}{r-l} &0 &0 & 0\\ 0 &\frac{2}{t-b} &0 & 0\\ 0 &0 &\frac{2}{n-f} & -\frac{n+f}{n-f}\\ 0 &0 &0 &1 \end{bmatrix}\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ 0 & 0 & n+f & -nf \\0&0&1&0\end{bmatrix} = \begin{bmatrix} \frac{2n}{r-l} &0 & 0 & 0 \\ 0 &\frac{2n}{t-b} & 0 &0 \\ 0 &0 &\frac{n+f}{n-f} & \frac{-2nf}{n-f} \\ 0 &0 &1 &0 \end{bmatrix}$
#### 3.2.4 使用FOV和Aspect ratio表示投影矩阵

![[Pasted image 20251021190651.jpg|400]]

在图中$\angle T_1OB_1$我们称为Field of View(for Y/for Vertical), 也就是常说的FOV。自然而然$\angle L_1OR_1$是x轴或者水平方向的FOV，我们只需要知道其中一个即可，通常用y轴的。我们设$\angle T_1OB_1=\theta$。

$L_1R_1$的长度（即为宽，设值为w）与$T_1B_1$的长度（即为高，设值为h）比例我们称之为宽高比（**Aspect ratio**），我们假设为该值为 a，即$a=\frac{w}{h}$。
同时得到：
$$\left\{\begin{matrix} w=r-l\\ h=t-b \end{matrix}\right.$$
表示方式需要我们的视锥体为前面介绍的对称视锥体,因此我们直接将上面的式子带入对称视锥体对应的透视投影矩阵$\mathbf{P}_{persp}$中，得：
$$P_{persp}=\begin{bmatrix} \frac{2n}{w} &0 & 0 & 0 \\ 0 &\frac{2n}{h} &0 &0 \\ 0 &0 &\frac{n+f}{n-f} & \frac{-2nf}{n-f} \\ 0 &0 &1 &0 \end{bmatrix}$$
通过上面yz平面的侧面图：

![[Pasted image 20251021193758.png|400]]

$$
\begin{align}
&可以发现\tan\frac{\theta}{2} = \frac{h}{2n},即\frac{2n}{h} = \frac{1}{\tan\frac{\theta}{2}}  \\
&又因为w=ah ,\frac{2n}{w}=\frac{2n}{ah} = \frac{1}{a \tan\frac{\theta}{2}}\\
\end{align}
$$

所以可得，FOV为 $θ$ ，宽高比为 $a$ 时，透视投影矩阵为：

$$\mathbf{P}_{persp}=\begin{bmatrix} \frac{1}{a \tan\frac{\theta}{2}} &0 & 0 & 0 \\ 0 &\frac{1}{\tan\frac{\theta}{2}} &0 &0 \\ 0 &0 &\frac{n+f}{n-f} & \frac{-2nf}{n-f} \\ 0 &0 &1 &0 \end{bmatrix}$$

### 3.3 裁剪空间（Clip Space)
假如在MV变换后，视图空间（View Space）下的某个点对应的齐次坐标为 (x,y,z,1)，那么经过透视投影变换后，其齐次坐标应为：

$$\begin{bmatrix} \frac{2n}{r-l} &0 & 0 & 0 \\ 0 &\frac{2n}{t-b} & 0 &0 \\ 0 &0 &\frac{n+f}{n-f} & \frac{-2nf}{n-f} \\ 0 &0 &1 &0 \end{bmatrix} \begin{bmatrix}x_{in}\\y_{in}\\z_{in}\\1\end{bmatrix} =\begin{bmatrix}x_{out}\\y_{out}\\z_{out}\\z_{in}\end{bmatrix}$$

而投影变换后的坐标(x,y,z,w)所在的空间即为裁剪空间，也称为齐次裁剪空间。

接着GPU会**在裁剪空间下做裁剪**，剔除掉不在视椎体范围内的顶点，怎么判断呢？
根据齐次坐标的定义我们知道 (x,y,z,w) 与 (x/w,y/w,z/w,1) 是等价的，即把裁剪空间下的(x,y,z,w)分别除以w，这一步我们称之为**透视除法（Perspective Divide）**。
在裁剪空间中任意顶点(x,y,z,w)如果不满足 (-w<x<w && -w<y<w && -w<z<w) 的条件即说明不在视椎体内，需要被裁剪。
裁剪后剩下的顶点，我们做一次透视除法，即可把它们从裁剪空间变换到NDC。

>[!important] 标准化设备坐标（Normalized Device Coordinate，NDC）
>NDC也就是我们前面所提到的标准立方体，即该空间内的任意坐标(x,y,z)满足 (-1<x<1 && -1<y<1 && -1<z<1)的条件，也就是裁剪空间中做完裁剪后再做透视除法得到的坐标。NDC中的顶点最后都要输出到屏幕空间当中。













