package res

var (
	out     = ""
	content *string
)

func Mix(dir string, html *string) {
	out = dir
	content = html

	text := []string{
		".json",
	}

	for _, t := range text {
		TextMix(t)
	}
}

func TextMix(suffix string) {

}
