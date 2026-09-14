from django.http import JsonResponse


def health(_request):
    return JsonResponse({"status": "ok"})


def trades(_request):
    response = JsonResponse(
        {
            "trades": [
                {
                    "id": "t1",
                    "send": "Bench RB",
                    "receive": "TE2",
                    "teamADelta": 4.2,
                    "teamBDelta": 3.1,
                }
            ]
        }
    )
    response["Access-Control-Allow-Origin"] = "*"
    return response
