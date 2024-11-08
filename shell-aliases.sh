alias ..="cd .."
alias ...="cd ../.."

alias cpu="top -o cpu"
alias mem="top -o rsize"

alias ls="ls -G"
alias l1="ls -1 --group-directories-first"

alias grep="grep --color=always"
alias sed=gsed

alias v="nvim"

alias c="pbcopy"
alias p="pbpaste"

take() {
  mkdir -p $1 && cd $1
}

j() {
  local path=$(jump-dir $1)
  test -n "$path" && cd $path || echo 'Unknown shortcut'
}
