package routes

import (
	"html/template"
	"net/http"
)

func rootHandler(w http.ResponseWriter, req *http.Request) {
	var tmpl = template.Must(template.ParseFiles("../../static/index.html"))
	tmpl.Execute(w, nil)
}

func staticHandler(w http.ResponseWriter, req *http.Request) {
	http.StripPrefix("/static/", http.FileServer(http.Dir("../../static/"))).ServeHTTP(w, req)
}

func StartServer() {
	http.HandleFunc("/", rootHandler)
	http.Handle("/static/", http.HandlerFunc(staticHandler))
	http.ListenAndServe(":8080", nil)
}
