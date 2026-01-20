[GAMES101（现代计算机图形学入门）笔记 - Yu_Tang](https://tanyuu.github.io/2024.01-07/GAMES101%E7%AC%94%E8%AE%B0/#lecture-05-rasterization-1-triangles%E5%85%89%E6%A0%85%E5%8C%961-%E4%B8%89%E8%A7%92%E5%BD%A2)
## 1 概念回顾
视角变换之后，所有的物体均已经变换至${[-1,1]}^3$的空间中，接下来应该考虑如何将其绘制出来；

视角（field-of-view），fovY为垂直视场角，fovX为水平视场角，此课程中fov默认为垂直视场角；

在视角变换之后，相机位于原点， $y^{+}$轴为上，$z^{-}$轴为朝向，即有$l=-r,b=-t$；

考虑 fovY 、aspect_ratio 与 l, r, b, t 的关系，如图所示：
![[Pasted image 20251022130956.jpg]]
$$
\begin{align}
&\tan\frac{fovY}2=\frac t{|n|}\\
&aspect=\frac r t
\end{align}
$$
## 2 光栅化
我们将屏幕视为二维数组，**光栅化（rasterize）** 即为在屏幕上绘制的过程；
### 2.1 屏幕坐标空间的特点
此课程中规定，屏幕空间的像素坐标视作分别代表X、Y轴位置的整数数对，如下图蓝色位置为 (2,1) ；
![[Pasted image 20251022131138.png|400]]
于 $\text {width}\times \text{height}$ 的屏幕，其像素坐标范围为 (0, 0) 到 (width-1, height-1) ；

虽然像素坐标为整数坐标，但是坐标为 (x, y) 的像素中心在 (x+0.5, y+0.5) ；屏幕覆盖范围为 (0, 0) 到 (width, height) ；
我们需要完成从${[-1,1]}^{3}$到$[0,width]\times[0,height]$的映射；

我们先不考虑 z 坐标，将 xy 坐标拉伸至屏幕范围，有视口变换矩阵：
$$M_{viewport}=
\begin{bmatrix}
\frac {width}2&0&0&\frac {width}2\\
0&\frac {height}2&0&\frac {height}2\\
0&0&1&0\\
0&0&0&1
\end{bmatrix}$$
### 2.2 采样(Sample)
定义布尔函数 `inside(tri, x, y)` ，其中xy不要求整数，含义为：
$$\text{inside}(tri,x,y)=
\begin{cases}
1&(x,y) \text{ in triangle }tri\\
0&\text{otherwise}
\end{cases}$$
```cpp
for(int x = 0; x < xmax; ++x)  
for(int y = 0; y < ymax; ++y)  
image[x][y] = inside(tri, x + 0.5, y + 0.5);
```

可以用同侧法来判断点是否在三角形内
>[!important] 具体判断步骤
>**具体判断步骤（以三角形 ABC 和点 P 为例）**
>需构建 3 组 “边向量” 和 “点到边的向量”，通过叉乘方向是否一致来判断：
>① 对边 AB：构建向量 `AB = B - A`、`AP = P - A`，计算叉乘 `cross1 = AB × AP`；
>② 对边 BC：构建向量 `BC = C - B`、`BP = P - B`，计算叉乘 `cross2 = BC × BP`；
>③ 对边 CA：构建向量 `CA = A - C`、`CP = P - C`，计算叉乘 `cross3 = CA × CP`。
>若 **cross1、cross2、cross3 全部同号（均正或均负）**，说明点 P 始终在三角形三边的 “同一侧”（均在三边的逆时针侧或均在顺时针侧），则 P 在三角形内；若存在异号，则 P 在外部；若某一叉乘为 0，说明 P 在对应边上（需按规则统一处理，如归为 “在内部” 或 “在外部”，避免重复计数）。

关于点在边界上的情况，按统一标准处理即可；
考虑枚举所有像素的低效，我们可以只扫描三角形轴向包围盒（axis-aligned bounding box，AABB）中的像素（$[X_{min},X_{max}]\times[Y_{min},Y_{max}]$）；
对于细长且旋转的三角形，AABB 策略会被降低效率，可以使用增量遍历策略：
![[Pasted image 20251022132626.png|400]]
从三角形左下角的顶点所在的像素开始，逐个像素向右遍历，直到某个像素的中心在三角形外部，之后向上移动一个像素，继续向右遍历

### 2.3 反走样
走样：CG（Computer Graphic)中不符合预期的采样（Sampling Artifacts (Errors/Mistakes/Inaccuracies) in Computer Graphics），包括锯齿、摩尔纹、车轮效应等；

#### 2.3.1 **奈奎斯特定理**
奈奎斯特定理，又称为**香农采样定理**,
奈奎斯特定理指出，为了不失真地恢复模拟信号，采样频率应该大于等于模拟信号频谱中最高频率的两倍，即：
$f_{s} ≥ 2f_{max}$

>[!note] 频谱与傅里叶变换
>傅里叶变换的核心作用是 “域的转换”，而频谱就是这个转换的直接产物。
>1. **输入：时域信号**。比如一段音乐的波形图，横轴是时间，纵轴是声音的强弱（振幅），这就是典型的时域信号。
>2. **处理：傅里叶变换**。它会把这个时域信号拆解成无数个不同频率的正弦波 —— 这些正弦波就是信号的 “基本组成单元”。
>3. **输出：频域频谱**。将拆解后的所有频率成分，按 “频率高低” 排序，再标注每个频率成分的 “强度”（或相位），最终形成的图形或数据就是频谱。

>[!note] 离散傅里叶变换（DFT）
> 不用公式的话，可以把它理解成：给你一串 “时间点上的信号值”（比如每秒采 1 个点，采了 10 个点），DFT 能算出 “这串信号里包含哪些频率（比如 2Hz、5Hz），每个频率的信号有多强”，而且这些频率是 “离散的、不连续的”。

1、定义 “理想采样” 与信号模型
连续带限信号 $x(t)$，其最高频率为 $f_m$（即当 $|f| > f_m$时，频谱 $X(f) = 0$)；
采样周期为 $T_s$，采样频率 $F_s = \frac{1}{T_s}$；
理想采样信号$x_s(t)$是$x(t)$与冲激采样串 $p(t) = \sum_{n=-\infty}^{\infty} \delta(t - nT_s)$的乘积，即：$$x_s(t) = x(t) \cdot p(t) = x(t) \sum_{n=-\infty}^{\infty} \delta(t - nT_s) = \sum_{n=-\infty}^{\infty} x(nT_s) \delta(t - nT_s)$$
2、求采样信号的傅里叶变换 $X_s(f)$
根据傅里叶变换的 **“时域乘积→频域卷积”** 性质，若 $x_s(t) = x(t) \cdot p(t)$，则其傅里叶变换为：
$X_s(f) = X(f) * P(f)$
其中，$P(f)$ 是冲激采样串 $p(t)$ 的傅里叶变换。
冲激采样串 $p(t) = \sum_{n=-\infty}^{\infty} \delta(t - nT_s)$ 的傅里叶变换为冲激串
$$P(f) = \frac{1}{T_s} \sum_{k=-\infty}^{\infty} \delta(f - kF_s)$$
（推导：冲激串是周期信号，周期 $T_s$，其傅里叶级数系数为 $\frac{1}{T_s}$，因此傅里叶变换是间隔 $F_s$、幅度 $\frac{1}{T_s}$ 的冲激串。）
$$X_s(f) = X(f) * \frac{1}{T_s} \sum_{k=-\infty}^{\infty} \delta(f - kF_s) = \frac{1}{T_s} \sum_{k=-\infty}^{\infty} X(f - kF_s)$$
这表明：采样后的频谱是原频谱以 $F_s$ 为周期的无限重复（频谱副本）。
3、推导 “无混叠” 的采样条件
要从 $x_s(t)$ 无失真恢复 $x(t)$，需保证各频谱副本之间无重叠（即 “无混叠”）。

由于原信号是带限的（$|f| > f_m$ 时 $X(f) = 0$），第 $k=1$ 个频谱副本 $X(f - F_s)$ 的有效范围是：
$$f - F_s \in [-f_m, f_m] \implies f \in [F_s - f_m, F_s + f_m]$$
为了让 $X(f - F_s)$
与原频谱 $X(f)$（范围 $[-f_m, f_m]$）不重叠，需满足：
$$F_s - f_m \geq f_m即F_s \geq 2f_m$$
![[Pasted image 20251022154454.png|500]]
如果采样率不足（fs较小）或高频丰富（f0较大）时，便会发生频谱混叠（aliasing），即为走样；
进一步说，除了**增加采样率**外，还可以通过**先低通滤波再采样**的方法；
![[Pasted image 20251022154510.png|500]]
#### 2.3.2 解决方法
超采样(Super-Sample Anti-Aliasing, SSAA)
将每个像素划分为更多小的像素，分别对小像素进行采样后进行平均；

多重采样（Multi-Sample AA，MSAA）
不同于SSAA，SSAA对于所有子采样点着色，而MSAA只对当前模型所更新的子采样点进行着色；
SSAA与MSAA都需要进行解析（Resolve），信号必须重新采样到指定的分辨率，这样我们才可以显示它；
SSAA和MSAA会大量消耗算力，实际实现上可能通过不规则分布和像素复用等方法降低消耗；

快速近似（Fast Approximate AA，FXAA）
在光栅化后带锯齿的图像上寻找边界，将边界替换为没有锯齿的边界；

时域抗锯齿（Temporal AA，TAA）
类似于在时域上进行多重采样；

深度学习超分辨率（Deep Learning Super Sampling，DLSS）
### 2.4 深度绘制
#### 2.4.1 画家算法（Painters’ Algorithm）
从远到近绘制，近的物体覆盖远的物体；
同距离物体的绘制顺序并不随意，会出现遮挡问题：
也可能出现无法解决的深度组合：
![[Pasted image 20251022164744.png]]
#### 2.4.2 深度缓冲
_为了简单起见，此部分我们认为 z 总是正的，z 越小物体离相机越近_
在渲染图像时同时生成两个结果：对于想要的图像存储在 frame buffer ，对于每个像素的深度信息存储在 depth buffer；
深度缓存对于每个像素，只维护此帧中最小的 z 值；
```
lnitialize depth buffer to ∞;  
During rasterization:  
	foreach (triangle T)  
		foreach (sample (x,y,z) in T)  
			if (z < zbuffer[x,y]) // closest sample so far  
				framebuffer[x,y] = rgb; // update color  
				zbuffer[×,y] = z; // update depth  
			else  
				; // do nothing, this sample is occluded
```
在 MSAA 策略下，z-buffer 粒度会上升至每一个采样点；
z-buffer 不能处理透明物体的深度问题；

