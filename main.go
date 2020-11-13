package main

import (
	"c3d2one/mix/engine"
	"c3d2one/mix/res"
	"fmt"
	"github.com/Jecced/go-tools/src/ak"
	"github.com/Jecced/go-tools/src/fileutil"
)

var (
	mobileDir = "/Users/ankang/develop/projects/git/test/cocos_demo/c3d_demo_01/build/web-mobile"
	outDir    = "/Library/WebServer/Documents/game/test"
	htmlFile  = outDir + ak.PS + "index.html"
)

func main() {
	fmt.Println("清空输出目录", outDir)
	fileutil.ClearDir(outDir)
	fmt.Println("文件夹拷贝", mobileDir, outDir)
	fileutil.DirCopy(mobileDir, outDir)
	fmt.Println("替换template模板文件")
	fileutil.DirCopy("template", outDir)
	fmt.Println("增加plugin插件脚本")
	fileutil.DirCopy("plugin", outDir)
	htmlContent, err := fileutil.ReadText(htmlFile)
	if err != nil {
		fmt.Println(err)
	}

	engine.Mix(outDir, &htmlContent)
	res.Mix(outDir, &htmlContent)
	fileutil.WriteText(htmlContent, htmlFile)
	fileutil.DelEmptyDir(outDir)
}
