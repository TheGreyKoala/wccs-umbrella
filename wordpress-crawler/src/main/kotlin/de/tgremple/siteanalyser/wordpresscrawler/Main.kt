package de.tgremple.siteanalyser.wordpresscrawler

import com.mashape.unirest.http.Unirest

fun main(args: Array<String>) {
    val result = Unirest
            .post("http://localhost:44284/analyse")
            .header("Content-Type", "application/json")
            .body("""{"url": "http://www.fernuni-hagen.de/KSW/portale/babw/service/"}""")
            .asJson()

    val message = if (result.status == 201) "Success" else "Error"
    println(message)
}
