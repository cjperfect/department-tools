const DOMAIN = 'tool.manmanbuy.com'
const output = document.getElementById('cookieOutput')
const statusEl = document.getElementById('status')
const btnFetch = document.getElementById('btnFetch')
const btnCopy = document.getElementById('btnCopy')

let currentCookie = ''

function setStatus(type, message) {
  statusEl.className = `status ${type}`
  statusEl.textContent = message
}

async function fetchCookies() {
  statusEl.className = ''
  statusEl.textContent = ''
  btnFetch.disabled = true
  btnFetch.textContent = '⏳ 获取中...'
  btnCopy.disabled = true
  output.value = ''
  currentCookie = ''

  try {
    const cookies = await chrome.cookies.getAll({ domain: DOMAIN })
    if (!cookies.length) {
      setStatus('info', `未找到 ${DOMAIN} 的 Cookie，请先在浏览器中打开慢慢买网站`)
      return
    }

    currentCookie = cookies.map((c) => `${c.name}=${c.value}`).join('; ')
    output.value = currentCookie
    btnCopy.disabled = false

    const httpOnly = cookies.filter((c) => c.httpOnly)
    setStatus('success', `获取 ${cookies.length} 个 Cookie（${httpOnly.length} 个 HttpOnly）`)
  } catch (e) {
    setStatus('error', `获取失败: ${e.message}`)
  } finally {
    btnFetch.disabled = false
    btnFetch.textContent = '🔄 获取 Cookie'
  }
}

async function copyToClipboard() {
  if (!currentCookie) return
  try {
    await navigator.clipboard.writeText(currentCookie)
    btnCopy.textContent = '✅ 已复制!'
    setTimeout(() => { btnCopy.textContent = '📋 复制' }, 1500)
  } catch {
    output.select()
    btnCopy.textContent = '⚠️ 请 Ctrl+C'
    setTimeout(() => { btnCopy.textContent = '📋 复制' }, 2000)
  }
}

btnFetch.addEventListener('click', fetchCookies)
btnCopy.addEventListener('click', copyToClipboard)

// 打开弹窗自动获取
fetchCookies()
