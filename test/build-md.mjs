import fs from 'fs'
import markdownit from 'markdown-it'
import highlightjs from 'markdown-it-highlightjs';

fs.rmSync('src/md-vue', { recursive: true, force: true })
fs.mkdirSync('src/md-vue')

const md = markdownit({
    breaks: true,
    linkify: true,
})

md.use(highlightjs, {
    auto: false,
})

for (const name of fs.readdirSync('src/md')) {
    const mdText = fs.readFileSync('src/md/' + name).toString()
    const html = md.render(mdText).replaceAll('<a ', '<a target="_blank" ')
    const vue = '<template>\n' + html + '\n</template>'
    fs.writeFileSync('src/md-vue/' + name.replace(/\.md$/i, '.vue'), vue)
}
