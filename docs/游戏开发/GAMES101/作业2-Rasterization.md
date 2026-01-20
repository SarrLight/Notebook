## 1 作业实现
### 1.1 insideTriangle()
这是一个用于判断某个点是否在三角形内部的函数。
```cpp
static bool insideTriangle(int x, int y, const Vector3f* _v)
{   
    // TODO : Implement this function to check if the point (x, y) is inside the triangle represented by _v[0], _v[1], _v[2]
    Eigen::Vector3f P (x, y, 0);
    Eigen::Vector3f AP = P - _v[0];
    Eigen::Vector3f BP = P - _v[1];
    Eigen::Vector3f CP = P - _v[2];
    Eigen::Vector3f AB = _v[1] - _v[0];
    Eigen::Vector3f BC = _v[2] - _v[1];
    Eigen::Vector3f CA = _v[0] - _v[2];

    float crossAPAB = AP.cross(AB).z();
    float crossBPBC = BP.cross(BC).z();
    float crossCPCA = CP.cross(CA).z();

    return (crossAPAB >= 0 && crossBPBC >= 0 && crossCPCA >= 0) || (crossAPAB <= 0 && crossBPBC <= 0 && crossCPCA <= 0);
}
```
如果三个叉乘结果的z值都同号，则说明点在三角形内部。
如果出现异号，则说明点在三角形外部。
如果出现0，则说明点在三角形边上。
### 1.2 三角形的光栅化
使用`std::min`和`std::max`获得屏幕三角形的bounding box

使用`floorf()`和`ceilf()`对float类型的值进行向下或向上取整

遍历bounding box中像素的中心，使用insideTriangle()函数来判断像素中心是否在三角形内部。如果在内部，进行z差值得到z_interpolated，与depth_buf中的值进行比较，如果在前，则把颜色和深度信息写入帧缓冲和深度缓冲。
### 1.3 SSAA(Super Sampling Anti Aliasing)
在rasterizer中增加更大的帧缓冲和深度缓冲，其中相邻的四个元素对应一个像素的4个采样点。之后按照正常光栅化的思路，进行计算。最后对SSAA的帧缓冲进行取平均，即4个采样点的颜色取平均值，输出到输出的帧缓冲中。
简而言之，就是渲染一张$height\times wight\times 4$的画面，之后取平均得到$height\times wight$大小的画面
不使用SSAA和使用SSAA得到的结果如下面两图所示
![[image1.png|400]]
![[image0.png|400]]

>[!bug] SSAA后的结果有毛刺
>检查后发现是SSAA中的索引计算出错，并且InsideTriangle()函数的参数类型错误地设定为int。
>纠错后，SSAA结果如下图

![[output00.png|400]]
>[!note] 注意
>在程序中，索引计算和类型定义非常重要！！！
### 1.4 z插值算法
```cpp
// If so, use the following code to get the interpolated z value.
auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
z_interpolated *= w_reciprocal;
```
代码中的computeBarycentric2D()用于计算三角形的2D重心坐标$(\alpha,\  \beta,\  \gamma)$
整理一下`z_interpolated`的计算公式如下
$$z_{\text{interpolated}} = \frac{ \alpha \cdot \frac{z_0}{w_0} + \beta \cdot \frac{z_1}{w_1} + \gamma \cdot \frac{z_2}{w_2} }{ \alpha \cdot \frac{1}{w_0} + \beta \cdot \frac{1}{w_1} + \gamma \cdot \frac{1}{w_2} }$$
我对这个公式的感性理解是：
$$
\frac{z_{\text{interpolated}} }{w_{\text{interpolated}}}= \alpha \cdot \frac{z_0}{w_0} + \beta \cdot \frac{z_1}{w_1} + \gamma \cdot \frac{z_2}{w_2} 
$$
$$
\frac{1}{w_{\text{interpolated}}}= \alpha \cdot \frac{1}{w_0} + \beta \cdot \frac{1}{w_1} + \gamma \cdot \frac{1}{w_2}
$$
这段代码其实有问题，那就是在这之前已经进行了归一化操作，因此到这里时，各顶点的$w$坐标都是1，所以这段代码实际的计算公式是下面这样的：
$$
z_{\text{interpolated}} =\alpha \cdot {z_0} + \beta \cdot {z_1} + \gamma \cdot {z_2}
$$
#### 1.4.1 重心坐标和奔驰定理
>[!note] 重心坐标 
>在三角形$ABC$中任意一点$P$,若满足$P=c_1A+c_2B+c_3C$且$c_1 + c_2 + c_3 = 1$，则称$(c_1, c_2, c_3)$为$P$在三角形$ABC$的重心坐标
![[Pasted image 20251023105211.png|400]]

如何计算重心坐标
根据重心坐标的定义$\overrightarrow{OP}=c_1\overrightarrow{OA}+c_2\overrightarrow{OB}+c_3\overrightarrow{OC}$
$$
\begin{align}
\overrightarrow{BP}&=\overrightarrow{OP}-\overrightarrow{OB}\\
&=\overrightarrow{OP}-(
c_1\overrightarrow{OB}+c_2\overrightarrow{OB}+c_3\overrightarrow{OB})
\\
&=
c_1\overrightarrow{BA}+c_3\overrightarrow{BC}\\
\end{align}
$$
$$
\overrightarrow{BP}\times \overrightarrow{BA}=c_3\overrightarrow{BC}\times \overrightarrow{BA}
$$
$$
c_3=\frac{|\overrightarrow{BP}\times \overrightarrow{BA}|}{|\overrightarrow{BC}\times \overrightarrow{BA}|}
$$
以此类推，可以计算出重心坐标$(c_1,c_2,c_3)$

根据奔驰定理，也可以得到重心坐标的计算公式，奔驰定理的证明可以用几何法，也可以用上面这种叉乘法。
>[!note] 奔驰定理
>对于$△ABC$内一点$P$，记$S_A=S_{△PBC}$，$S_B=S_{△PAC}$，$S_C=S_{△PAB}$，则$S_A\cdot\overrightarrow{PA}+S_B\cdot\overrightarrow{PB}+S_C\cdot\overrightarrow{PC}=\overrightarrow{0}$

**具体实现**
设三角形的三个顶点为$\mathbf{v}_0 = (x_0, y_0)$、$\mathbf{v}_1 = (x_1, y_1)$、$\mathbf{v}_2 = (x_2, y_2)$，待求重心坐标的点为$P = (x, y)$。代码计算的是点$P$相对于该三角形的 2D 重心坐标$(c_1, c_2, c_3)$，其数学表达式如下：
重心坐标公式
$c_1$的计算公式：
$$c_1 = \frac{ x(y_1 - y_2) + (x_2 - x_1)y + x_1y_2 - x_2y_1 }{ x_0(y_1 - y_2) + (x_2 - x_1)y_0 + x_1y_2 - x_2y_1 }$$

$c_2$的计算公式：
$$c_2 = \frac{ x(y_2 - y_0) + (x_0 - x_2)y + x_2y_0 - x_0y_2 }{ x_1(y_2 - y_0) + (x_0 - x_2)y_1 + x_2y_0 - x_0y_2 }$$

$c_3$的计算公式：
$$c_3 = \frac{ x(y_0 - y_1) + (x_1 - x_0)y + x_0y_1 - x_1y_0 }{ x_2(y_0 - y_1) + (x_1 - x_0)y_2 + x_0y_1 - x_1y_0 }$$
重心坐标$(c_1, c_2, c_3)$的核心意义是面积比值：
分子部分对应点$P$与三角形两条边组成的小三角形的面积（的 2 倍，因公式中省略了 1/2 系数）；
分母部分对应原三角形$\mathbf{v}_0\mathbf{v}_1\mathbf{v}_2$的面积（的 2 倍）。
重心坐标满足$c_1 + c_2 + c_3 = 1$

#### 1.4.2 差值原理推导
[图形学 - 关于透视矫正插值那些事 - 知乎](https://zhuanlan.zhihu.com/p/403259571)
![[Pasted image 20251023101923.jpg]]
**现在我们的问题是**：已知屏幕上一点P'，且$P'=(1-m)A'+mB'$，还有顶点A和B的世界坐标，**需要求出与P'对应的点P关于AB的表示：**$P=(1-n)A+nB$。
则由相似可得
$$\frac{n}{1-n}=\frac{|AG|}{|BK|}=\frac{|A'P'|\frac{Z_1}{c}}{|B'P'|\frac{Z_2}{c}}=\frac{mZ_1}{(1-m)Z_2}$$
对左右两边取倒数得：
$$\begin{aligned} \frac{1}{n}-1&=\frac{(1-m)Z_2}{mZ_1}\\ n&=\frac{mZ_1}{(1-m)Z_2+mZ_1} \end{aligned}$$
P点的z坐标
$$\begin{aligned} Z_n&=(1-n)Z_1+nZ_2\\ &=\frac{(1-m)Z_2}{(1-m)Z_2+mZ_1}Z_1+\frac{mZ_1}{(1-m)Z_2+mZ_1}Z_2 \\ &=\frac{Z_1Z_2}{(1-m)Z_2+mZ_1}\qquad·······················(*)\\ &=\frac{1}{\frac{1-m}{Z_1}+\frac{m}{Z_2}} \end{aligned}$$
从二维推导出三维空间中z坐标应该为:
$$Z_n=\frac{1}{\frac{1-u-v}{Z_1}+\frac{u}{Z_2}+\frac{v}{Z_3}}$$
其中$u,v$ 的含义为：点P可以用下面的公式表示
$$P=(1-u-v)A+uB+vC$$
这里的$(1-u-v,\ u,\ v)$其实就是点$P$在$\triangle ABC$ 中的重心坐标

#### 1.4.3 从矩阵的角度推导
在[[03-04 Transform]]中提到透视变换中，z轴方向上的变化不是线性的，例如原本near和far中点在变换后会更靠近far点。
让我们回看透视变换中非线性的这一部分，即从视锥体到长方体的变换，变换矩阵如下：

$$
\mathbf{T}=\begin{bmatrix} n & 0 & 0 & 0\\ 0 & n & 0 & 0\\ 0 & 0 & n+f & -nf \\0&0&1&0\end{bmatrix}
$$

我们通过下面的计算来探究一下**这个变换的性质**
假设存在点$A(x_1,y_1,z_1)$、点$B(x_2,y_2,z_2)$和点$P(x_3,y_3,z_3)$,它们经过$T$变换之后分别得到$A'(x_1',y_1',z_1')$、点$B'(x_2',y_2',z_2')$和点$P'(x_3',y_3',z_3')$,具体如下所示

$$
\begin{bmatrix}
x_1\\ y_2\\ z_1\\ 1
\end{bmatrix}
\Rightarrow
\begin{bmatrix}
x_1'\\ y_2'\\ z_1'\\ 1
\end{bmatrix}
=\begin{bmatrix}
\frac{nx_1}{z_1} \\ \frac{ny_1}{z_1} \\ (n+f)-\frac{nf}{z_1}\\ 1
\end{bmatrix}
$$

我们称变换之前的空间为$S$,变换后的空间为$S'$.
设在变换前空间$S$中，点$P$在直线$AB$上，即 $P=aA+(1-a)B$,
##### 思路一：直接计算
首先，我们已知
$$
\left\{\begin{matrix}
x_3=ax_1+(1-a)x_2\\
y_3=ay_1+(1-a)y_2\\
z_3=az_1+(1-a)z_2
\end{matrix}\right.
$$
根据，转换公式
$$
\begin{align}
x_3'&=\frac{nx_3}{z_3}\\
&=\frac{n}{z_3}\cdot (ax_1+(1-a)x_2)\\
&=\frac{n}{z_3}\cdot (a\frac{z_1}{n}\cdot x_1'+(1-a)\frac{z_2}{n}\cdot x_2')\\
&=\frac{az_1}{z_3}\cdot x_1'+\frac{(1-a)z_2}{z_3}\cdot x_2' \\
同理\quad y_3'&=\frac{az_1}{z_3}\cdot y_1'+\frac{(1-a)z_2}{z_3}\cdot y_2' 
\end{align} 
$$
可以发现
$$
\frac{az_1}{z_3}+\frac{(1-a)z_2}{z_3}=\frac{az_1+(1-a)z_2}{z_3}
=\frac{z_3}{z_3}=1
$$
$$
因此取
\left\{\begin{matrix}
b=\frac{az_1}{z_3}\\
1-b=\frac{(1-a)z_2}{z_3}\\
\end{matrix}\right.
,则 \
\left\{\begin{matrix}
x_3'=bx_1'+(1-b)x_2'\\
y_3'=by_1'+(1-b)y_2'\\
\end{matrix}\right.
$$
变形可以得到
$$
\frac{a}{z_3}=\frac{b}{z_1}\quad \frac{1-a}{z_3}=\frac{1-b}{z_2}
$$
因此
$$
\frac{1}{z_3}= \frac{a}{z_3}+\frac{1-a}{z_3}=\frac{b}{z_1}+\frac{1-b}{z_2}
$$
进而说明
$$
\begin{align}
z_3'&=(n+f)-\frac{nf}{z_3} \\
&=(n+f)(b+1-b)-nf(\frac{b}{z_1}+\frac{1-b}{z_2}) \\
&=b(n+f-\frac{nf}{z_1})+(1-b)(n+f-\frac{nf}{z_2}) \\
&=bz_1'+(1-b)z_2'
\end{align}
$$
综上，
$$
\left\{\begin{matrix}
x_3'=bx_1'+(1-b)x_2'\\
y_3'=by_1'+(1-b)y_2'\\
z_3'=bz_1'+(1-b)z_2'
\end{matrix}\right.
$$
因此，变换后空间$S'$中，点$P'$在直线$A'B'$上，即 $\exists b,\ P'=bA'+(1-b)B'$,


##### 思路二：先假设后验证
我们假设变换后空间$S'$中，点$P'$在直线$A'B'$上，即 $\exists b,\ P'=bA'+(1-b)B'$,

$$
\left\{\begin{matrix}
x_3=ax_1+(1-a)x_2\\
y_3=ay_1+(1-a)y_2\\
z_3=az_1+(1-a)z_2
\end{matrix}\right.
\quad
\left\{\begin{matrix}
x_3'=bx_1'+(1-b)x_2'\\
y_3'=by_1'+(1-b)y_2'\\
z_3'=bz_1'+(1-b)z_2'
\end{matrix}\right.
$$

$$
\frac{ax_1+(1-a)x_2}{ay_1+(1-a)y_2}
=\frac{bx_1'+(1-b)x_2'}{by_1'+(1-b)y_2'}
$$

令

$$
\eta_1=\frac{a}{1-a}\quad \eta_2=\frac{b}{1-b}\quad
$$

则

$$
\frac{\eta_1 x_1+x_2}{\eta_1 y_1+y_2}
=\frac{\eta_2 \frac{nx_1}{z_1}+\frac{nx_2}{z_2}}{\eta_2 \frac{ny_1}{z_1}+\frac{ny_2}{z_2}}
=\frac{\eta_2 \frac{z_2}{z_1}x_1+x_2}{\eta_2 \frac{z_2}{z_1}y_1+{y_2}}
$$
因此
$$
\eta_1=\eta_2\cdot\frac{z_2}{z_1}
\quad \Rightarrow\quad  
\frac{\eta_1}{\eta_2}=\frac{z_2}
{z_1}
\quad \Rightarrow\quad 
\frac{a}{1-a}=\frac{z_2}{z_1}\cdot \frac{b}{1-b}
$$
于是我们可以用$a,z_1,z_2$表示$b$,进而验证
$$
\left\{\begin{matrix}
x_3'=bx_1'+(1-b)x_2'\\
y_3'=by_1'+(1-b)y_2'
\end{matrix}\right.
$$
另一方面，我们可以这样表达
$$
\begin{align}
z_3&=\frac{\frac{z_2}{\cancel{z_1}}\cdot \frac{b}{1-b}}{\frac{z_2}{z_1}\cdot \frac{b}{1-b}+1}\cdot \cancel{z_1}+\frac{1}{\frac{z_2}{z_1}\cdot \frac{b}{1-b}+1}\cdot z_2\\
&=
\frac{\frac{z_2}{1-b}}{\frac{z_2}{z_1}\cdot \frac{b}{1-b}+1}\\
&=
\frac{z_1z_2}{z_2 b +z_1(1-b)}
\end{align}
$$
$$
\frac{1}{z_3}=\frac{b}{z_1}+\frac{1-b}{z_2}
$$
进而验证
$$
\begin{align}
z_3'&=(n+f)-\frac{nf}{z_3} \\
&=(n+f)(b+1-b)-nf(\frac{b}{z_1}+\frac{1-b}{z_2}) \\
&=b(n+f-\frac{nf}{z_1})+(1-b)(n+f-\frac{nf}{z_2}) \\
&=bz_1'+(1-b)z_2'
\end{align}
$$

## 2 第三方库
### 2.1 Eigen
#### 2.1.1 向量叉乘
```cpp
Eigen::Vector3f AP = P - _v[0];
Eigen::Vector3f AB = _v[1] - _v[0];
float crossAPAB = AP.cross(AB).z();
```

