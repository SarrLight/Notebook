## 1 任务
需要修改的函数在提供的 main.cpp 文件中。

- bezier：该函数实现绘制 Bézier 曲线的功能。它使用一个控制点序列和一个
OpenCV：：Mat 对象作为输入，没有返回值。它会使 t 在 0 到 1 的范围内进行迭代，并在每次迭代中使 t 增加一个微小值。对于每个需要计算的 t，将调用另一个函数 recursive_bezier，然后该函数将返回在 Bézier 曲线上 t处的点。最后，将返回的点绘制在 OpenCV ：：Mat 对象上。
- recursive_bezier：该函数使用一个控制点序列和一个浮点数 t 作为输入，
实现 de Casteljau 算法来返回 Bézier 曲线上对应点的坐标。

De Casteljau 算法说明如下：
1. 考虑一个 $p_0, p_1, ... p_n$ 为控制点序列的 Bézier 曲线。首先，将相邻的点连接起来以形成线段。
2. 用 $t : (1 − t)$ 的比例细分每个线段，并找到该分割点。
3. 得到的分割点作为新的控制点序列，新序列的长度会减少一。
4. 如果序列只包含一个点，则返回该点并终止。否则，使用新的控制点序列并转到步骤 1。
    使用 $[0,1]$ 中的多个不同的 $t$ 来执行上述算法，你就能得到相应的 Bézier 曲线。
更多相关知识请见 [De Casteljau算法](../10-12 Geometry#2.3.2 De Casteljau算法（de Casteljau Algorithm）)
## 2 代码结构
### 2.1 主函数流程

<iframe src="../作业4main函数.drawio.pdf"
    width="100%"
    height="400px"
    style="border: 1px solid #ccc; overflow: auto;">
</iframe>

## 3 我的实现
```cpp
cv::Point2f recursive_bezier(const std::vector<cv::Point2f> &control_points, float t) 
{
    // TODO: Implement de Casteljau's algorithm
    std::vector<cv::Point2f> new_points;
    int n = control_points.size();

    if (n==1) {
        return control_points[0];
    }

    for (int i = 0; i < n-1; i++){
        auto point = t * control_points[i] + (1 - t) * control_points[i + 1];
        new_points.push_back(point);
    }

    return recursive_bezier(new_points, t);
}

void bezier(const std::vector<cv::Point2f> &control_points, cv::Mat &window) 
{
    // TODO: Iterate through all t = 0 to t = 1 with small steps, and call de Casteljau's 
    // recursive Bezier algorithm.
    for (double t = 0.0; t <= 1.0; t+=0.001) {
        auto point = recursive_bezier(control_points, t);
        window.at<cv::Vec3b>(point.y, point.x)[2] = 255;
    }
}
```
### 3.1 结果
![[Pasted image 20251105130346.png|400]]
![[Pasted image 20251105130425.png|400]]
## 4 第三方库
### 4.1 OpenCV
```
window.at<cv::Vec3b>(point.y, point.x)[2] = 255;
```
在屏幕上绘制点
1. **对象与类型说明**
    - `window`：推测是一个`cv::Mat`类型的图像对象（OpenCV 中用于存储图像的矩阵类型）。
    - `cv::Vec3b`：OpenCV 中表示 “3 通道 8 位无符号整数” 的向量类型，通常用于存储 BGR 格式的彩色图像（3 个通道分别对应蓝、绿、红）。
    - `point`：推测是`cv::Point`类型的坐标对象，其中`point.x`表示列坐标（水平方向），`point.y`表示行坐标（垂直方向）。
2. **像素访问逻辑**
    - `window.at<cv::Vec3b>(point.y, point.x)`：通过`cv::Mat`的`at`方法访问指定像素。
        - 模板参数`<cv::Vec3b>`指定像素的类型为 3 通道 8 位值。
        - 参数`(point.y, point.x)`表示像素的位置：`point.y`是行索引，`point.x`是列索引（OpenCV 中图像的访问顺序为 “行优先”，即先定位行，再定位列，与`cv::Point(x,y)`的 x/y 对应）。
3. **通道操作**
    - `[2]`：访问`cv::Vec3b`的第三个元素。由于 OpenCV 默认图像为 BGR 格式，通道索引对应关系为：
        - `[0]`：蓝色通道（Blue）
        - `[1]`：绿色通道（Green）
        - `[2]`：红色通道（Red）
    - `= 255`：将红色通道的值设置为 255（8 位无符号整数的最大值，即红色最饱和）。
## 5 Cpp特性
### 5.1 std::vector容器
[C++ vector 容器 | 菜鸟教程](https://www.runoob.com/cplusplus/cpp-vector.html)
使用示例：
```cpp
#include <iostream>  
#include <vector>  
  
int main() {  
    // 创建一个空的整数向量  
    std::vector<int> myVector;  
  
    // 添加元素到向量中  
    myVector.push_back(3);  
    myVector.push_back(7);  
    myVector.push_back(11);  
    myVector.push_back(5);  
  
    // 访问向量中的元素并输出  
    std::cout << "Elements in the vector: ";  
    for (int element : myVector) {  
        std::cout << element << " ";  
    }  
    std::cout << std::endl;  
  
    // 访问向量中的第一个元素并输出  
    std::cout << "First element: " << myVector[0] << std::endl;  
  
    // 访问向量中的第二个元素并输出  
    std::cout << "Second element: " << myVector.at(1) << std::endl;  
  
    // 获取向量的大小并输出  
    std::cout << "Size of the vector: " << myVector.size() << std::endl;  
  
    // 删除向量中的第三个元素  
    myVector.erase(myVector.begin() + 2);  
  
    // 输出删除元素后的向量  
    std::cout << "Elements in the vector after erasing: ";  
    for (int element : myVector) {  
        std::cout << element << " ";  
    }  
    std::cout << std::endl;  
  
    // 清空向量并输出  
    myVector.clear();  
    std::cout << "Size of the vector after clearing: " << myVector.size() << std::endl;  
  
    return 0;  
}
```
单个数据与vector相乘，会把这个数据乘到vector的每个元素上，返回相乘得到的vector。
