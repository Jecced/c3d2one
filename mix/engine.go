package mix

import (
	"fmt"
	"github.com/Jecced/go-tools/src/ak"
	"github.com/Jecced/go-tools/src/fileutil"
	"github.com/Jecced/go-tools/src/strutil"
	"os"
	"strings"
)

var (
	outDir = ""
)

func EngineMix(dir string, html *string) {
	outDir = dir

	register := GetAllSystemRegister(outDir)
	InsertRegisterJs(register, html)

	InsertImportMap(html)

	FindAndMixScript(html)
	FindAndMixLink(html)
}

// 获取所有和System.register相关的js脚本
func GetAllSystemRegister(dir string) []string {
	jsList, err := fileutil.GetFilesBySuffix(dir, ".js")
	if err != nil {
		return nil
	}

	var out []string

	for _, js := range jsList {
		text, err := fileutil.ReadText(js)
		if err != nil {
			fmt.Println(err)
			continue
		}
		if strings.HasPrefix(text, "System.register(") {
			out = append(out, js)
		}
	}
	return out
}

func InsertRegisterJs(list []string, html *string) {
	for _, i2 := range list {
		i2 = strings.Replace(i2, outDir+ak.PS, "", -1)
		i2 = strings.Replace(i2, "\\", "/", -1)
		insert(html, i2)
	}
}

func insert(html *string, file string) {
	jsFile := outDir + ak.PS + file
	content, _ := fileutil.ReadText(jsFile)

	st := strings.Index(content, "(")
	content = content[:st+1] + "\"" + file + "\"," + content[st+1:]

	insert := "\n" + `<script>` + content + `</script>` + "\n"

	strutil.InsertString(html, insert, "<!-- SCRIPT -->")

	fmt.Println("删除", jsFile)

	_ = os.Remove(jsFile)
}

// 插入import-map.json到html内
func InsertImportMap(html *string) {
	file := outDir + ak.PS + "src/import-map.json"
	text, _ := fileutil.ReadText(file)
	insert := "<script> var importMapJson=" + text + "</script>\n"
	strutil.InsertString(html, insert, "<!-- JSON IMPORT-MAP -->")
	_ = os.Remove(file)
}

// 找到所有的script标签, 用src中的内容替换方块
func FindAndMixScript(html *string) {
	scripts := strutil.MatchString(*html, "<script src=", "</script>", true)
	for _, script := range scripts {
		ReplaceScriptBlock(html, script)
	}
}

func ReplaceScriptBlock(html *string, script string) {
	src := strutil.MatchStringFirst(script, "src=\"", "\"", false)
	path := outDir + ak.PS + src
	content, _ := fileutil.ReadText(path)
	insert := fmt.Sprintf(
		"\n<script>\n%s\n</script>\n",
		content,
	)

	*html = strings.Replace(*html, script, insert, -1)
	fmt.Println("删除", path)
	os.Remove(path)
}

// 找到所有link标签, 替换成stype标签
func FindAndMixLink(html *string) {
	links := strutil.MatchString(*html, "  <link rel=\"", ".css\"/>", true)
	for _, link := range links {
		ReplaceStyleBlock(html, link)
	}
}

func ReplaceStyleBlock(html *string, script string) {
	src := strutil.MatchStringFirst(script, "href=\"", "\"", false)
	path := outDir + ak.PS + src
	content, _ := fileutil.ReadText(path)
	insert := fmt.Sprintf(
		"\n<style>\n%s\n</style>\n",
		content,
	)

	*html = strings.Replace(*html, script, insert, -1)
	fmt.Println("删除", path)
	os.Remove(path)
}
